#!/usr/bin/env bash
# Build and deploy Reach Your Peak to Azure Container Apps.
#
#   infra/deploy.sh            # infra + images + app (idempotent; safe to rerun)
#   infra/deploy.sh migrate    # run `prisma migrate deploy` as a Container Apps job
#   infra/deploy.sh seed       # run the reference-data seed as a job
#   infra/deploy.sh admin you@example.com   # grant admin role (after signing up)
#   infra/deploy.sh egress     # print the outbound IP the jobs/apps use
#
# Reads DB_* and PROD_BETTER_AUTH_SECRET from .env.local (never committed).
# Override defaults with env vars: SUBSCRIPTION, RG, LOCATION, APP_NAME.
set -euo pipefail
export PYTHONIOENCODING=utf-8 PYTHONUTF8=1   # az CLI on Windows crashes printing build logs otherwise

SUBSCRIPTION="${SUBSCRIPTION:-fe55ccd1-a5d9-40a1-bcf7-e091838c5a7e}"   # "Wellness Portal"
RG="${RG:-rg-wellness-portal}"
LOCATION="${LOCATION:-centralus}"
APP_NAME="${APP_NAME:-wellness-portal}"

cd "$(dirname "$0")/.."
set -a; . ./.env.local; set +a
: "${DB_SERVER:?}" "${DB_USER:?}" "${DB_PASSWORD:?}" "${PROD_BETTER_AUTH_SECRET:?Add PROD_BETTER_AUTH_SECRET to .env.local}"

azs() { az "$@" --subscription "$SUBSCRIPTION" --only-show-errors; }
JOB="job-${APP_NAME}-migrate"

run_job() { # $1 = shell command to run in the tools image
  echo "▶ Starting job: $1"
  local exec image body status
  # Start via REST: `az containerapp job start --args` misparses values like "-c".
  image=$(azs containerapp job show -g "$RG" -n "$JOB" --query "properties.template.containers[0].image" -o tsv)
  body=$(IMAGE="$image" CMD="$1" node -e 'console.log(JSON.stringify({containers:[{name:"tools",image:process.env.IMAGE,command:["/bin/sh","-c",process.env.CMD]}]}))')
  exec=$(MSYS_NO_PATHCONV=1 az rest --method post --only-show-errors \
    --url "https://management.azure.com/subscriptions/$SUBSCRIPTION/resourceGroups/$RG/providers/Microsoft.App/jobs/$JOB/start?api-version=2024-03-01" \
    --body "$body" --query name -o tsv)
  echo "  execution: $exec (waiting)"
  while :; do
    status=$(azs containerapp job execution show -g "$RG" -n "$JOB" --job-execution-name "$exec" --query properties.status -o tsv)
    case "$status" in
      Succeeded|Failed|Stopped|Degraded) break ;;
    esac
    sleep 10
  done
  echo "  $exec: $status"
  job_logs "$exec"
  [ "$status" = "Succeeded" ]
}

# Console output of a job execution from Log Analytics (ingestion lags 1–5 min).
job_logs() {
  local ws query out
  ws=$(azs monitor log-analytics workspace show -g "$RG" -n "log-${APP_NAME}" --query customerId -o tsv)
  query="ContainerAppConsoleLogs_CL | where ContainerGroupName_s startswith '$1' | order by TimeGenerated asc | project Log_s"
  for _ in $(seq 1 20); do
    out=$(azs monitor log-analytics query -w "$ws" --analytics-query "$query" --query "[].Log_s" -o tsv 2>/dev/null || true)
    [ -n "$out" ] && { echo "  ── logs ──"; echo "$out" | sed 's/^/  /'; return; }
    sleep 15
  done
  echo "  (logs not ingested yet; check Log Analytics workspace log-${APP_NAME})"
}

# az CLI on Windows crashes streaming ACR build logs (cp1252), so queue and poll.
build_image() { # $1 = image:tag, $2 = Dockerfile target
  local run status
  run=$(azs acr build -r "$ACR" -t "$1" --target "$2" --no-logs --query runId -o tsv .)
  echo "  $1: run $run queued"
  while :; do
    status=$(azs acr task show-run -r "$ACR" --run-id "$run" --query status -o tsv)
    case "$status" in
      Succeeded) echo "  $1: built"; return 0 ;;
      Failed|Canceled|Error|Timeout) echo "✘ $1 $status. Logs: az acr task logs -r $ACR --run-id $run --subscription $SUBSCRIPTION > build.log"; return 1 ;;
    esac
    sleep 15
  done
}

case "${1:-deploy}" in
  migrate) run_job "npx prisma migrate deploy"; exit ;;
  seed)    run_job "npx tsx scripts/seed.ts"; exit ;;
  admin)   run_job "npx tsx scripts/make-admin.ts '${2:?email}'"; exit ;;
  egress)  run_job "node -e \"fetch('https://api.ipify.org').then(r=>r.text()).then(ip=>console.log('egress ip: '+ip))\""; exit ;;
  deploy)  ;;
  *) echo "usage: $0 [deploy|migrate|seed|admin <email>|egress]"; exit 2 ;;
esac

params=(
  appName="$APP_NAME"
  dbServer="$DB_SERVER" dbPort="${DB_PORT:-1433}" dbName="${DB_NAME:-WellnessPortal}" dbUser="$DB_USER"
  dbPassword="$DB_PASSWORD" dbTrustServerCertificate="${DB_TRUST_SERVER_CERTIFICATE:-false}"
  betterAuthSecret="$PROD_BETTER_AUTH_SECRET"
)

echo "▶ Resource group $RG ($LOCATION)"
azs group create -n "$RG" -l "$LOCATION" --tags app=reach-your-peak env=prod -o none

echo "▶ Base infrastructure (registry, Key Vault, identity, logs, environment)"
ACR=$(azs deployment group create -g "$RG" -n base -f infra/main.bicep \
  --parameters "${params[@]}" deployApp=false --query properties.outputs.acrName.value -o tsv)

TAG="$(date -u +%Y%m%d%H%M)-$(git rev-parse --short HEAD 2>/dev/null || echo local)"
echo "▶ Building images in $ACR (tag $TAG)"
build_image "web:$TAG" runner
build_image "tools:$TAG" tools

echo "▶ Container app + migration job"
azs deployment group create -g "$RG" -n app -f infra/main.bicep \
  --parameters "${params[@]}" deployApp=true webImage="web:$TAG" toolsImage="tools:$TAG" \
  --query "properties.outputs.{url:appUrl.value, outboundIp:outboundIp.value}" -o json
