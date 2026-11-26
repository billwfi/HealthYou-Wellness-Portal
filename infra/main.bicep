// Reach Your Peak wellness portal: Azure Container Apps hosting.
//
// Deploy in two passes (see infra/deploy.sh):
//   1. deployApp=false → registry, Key Vault, identity, logs, Container Apps environment
//   2. build images into the registry, then deployApp=true → web app + migration job

targetScope = 'resourceGroup'

@description('Azure region.')
param location string = resourceGroup().location

@description('Short name used in resource names.')
param appName string = 'wellness-portal'

@description('Create the container app and migration job (needs images in the registry).')
param deployApp bool = false

@description('Web image tag in the registry, e.g. web:20261124-abc123')
param webImage string = ''

@description('Tools image tag in the registry, e.g. tools:20261124-abc123')
param toolsImage string = ''

@description('SQL Server host.')
param dbServer string

param dbPort string = '1433'
param dbName string = 'WellnessPortal'
param dbUser string

@secure()
@description('SQL Server password (stored in Key Vault).')
param dbPassword string

@description('Self-signed SQL Server certificate?')
param dbTrustServerCertificate string = 'true'

@secure()
@description('Better Auth signing secret (stored in Key Vault).')
param betterAuthSecret string

@description('Web Push public key (VAPID); empty disables notifications.')
param vapidPublicKey string = ''

@secure()
@description('Web Push private key (VAPID), stored in Key Vault.')
param vapidPrivateKey string = ''

@description('Terra developer ID; empty runs device connections in demo mode.')
param terraDevId string = ''

@secure()
@description('Terra API key, stored in Key Vault.')
param terraApiKey string = ''

@secure()
@description('Terra webhook signing secret, stored in Key Vault.')
param terraWebhookSecret string = ''

@description('When the evening reminders run (cron, UTC). 01:00 UTC is 6 pm MST / 7 pm MDT.')
param reminderCron string = '0 1 * * *'

@description('Always-on replicas (1 avoids cold starts; 0 scales to zero).')
@minValue(0)
param minReplicas int = 1

param tags object = {
  app: 'reach-your-peak'
  env: 'prod'
}

var suffix = uniqueString(resourceGroup().id)

// Built-in role definition IDs
var acrPullRole = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
var kvSecretsUserRole = '4633458b-17de-408a-b874-0445c86b69e6'

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-${appName}'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: 'acrwp${suffix}'
  location: location
  tags: tags
  sku: { name: 'Basic' }
  properties: {
    adminUserEnabled: false
  }
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-${appName}'
  location: location
  tags: tags
}

resource acrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, identity.id, acrPullRole)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRole)
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kvwp${suffix}'
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 30
    enablePurgeProtection: true
  }
}

resource kvSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(kv.id, identity.id, kvSecretsUserRole)
  scope: kv
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', kvSecretsUserRole)
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource dbPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'db-password'
  properties: { value: dbPassword }
}

resource authSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'better-auth-secret'
  properties: { value: betterAuthSecret }
}

var pushEnabled = !empty(vapidPublicKey) && !empty(vapidPrivateKey)

resource vapidSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (pushEnabled) {
  parent: kv
  name: 'vapid-private-key'
  properties: { value: vapidPrivateKey }
}

var terraEnabled = !empty(terraDevId) && !empty(terraApiKey) && !empty(terraWebhookSecret)

resource terraKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (terraEnabled) {
  parent: kv
  name: 'terra-api-key'
  properties: { value: terraApiKey }
}

resource terraWebhookKvSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (terraEnabled) {
  parent: kv
  name: 'terra-webhook-secret'
  properties: { value: terraWebhookSecret }
}

// ── Network: fixed outbound IP via NAT gateway ─────────────────────────────────
// All outbound traffic from the apps leaves through one static public IP, so the
// SQL Server firewall can allow exactly that address.

resource natIp 'Microsoft.Network/publicIPAddresses@2024-05-01' = {
  name: 'pip-${appName}-nat'
  location: location
  tags: tags
  sku: { name: 'Standard' }
  properties: {
    publicIPAllocationMethod: 'Static'
    publicIPAddressVersion: 'IPv4'
  }
}

resource nat 'Microsoft.Network/natGateways@2024-05-01' = {
  name: 'ng-${appName}'
  location: location
  tags: tags
  sku: { name: 'Standard' }
  properties: {
    idleTimeoutInMinutes: 10
    publicIpAddresses: [ { id: natIp.id } ]
  }
}

resource vnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: 'vnet-${appName}'
  location: location
  tags: tags
  properties: {
    addressSpace: { addressPrefixes: [ '10.40.0.0/16' ] }
    subnets: [
      {
        name: 'snet-apps'
        properties: {
          addressPrefix: '10.40.0.0/23'
          natGateway: { id: nat.id }
          delegations: [
            { name: 'apps', properties: { serviceName: 'Microsoft.App/environments' } }
          ]
        }
      }
    ]
  }
}

resource env 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-${appName}'
  location: location
  tags: tags
  properties: {
    vnetConfiguration: {
      internal: false
      infrastructureSubnetId: vnet.properties.subnets[0].id
    }
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      { name: 'Consumption', workloadProfileType: 'Consumption' }
    ]
  }
}

var appUrl = 'https://${appName}.${env.properties.defaultDomain}'

var secrets = concat([
  { name: 'db-password', keyVaultUrl: dbPasswordSecret.properties.secretUri, identity: identity.id }
  { name: 'better-auth-secret', keyVaultUrl: authSecret.properties.secretUri, identity: identity.id }
], pushEnabled ? [
  { name: 'vapid-private-key', keyVaultUrl: vapidSecret!.properties.secretUri, identity: identity.id }
] : [], terraEnabled ? [
  { name: 'terra-api-key', keyVaultUrl: terraKeySecret!.properties.secretUri, identity: identity.id }
  { name: 'terra-webhook-secret', keyVaultUrl: terraWebhookKvSecret!.properties.secretUri, identity: identity.id }
] : [])

// Terra device connections (web app only). Without them the app runs a labeled demo.
var terraEnv = terraEnabled ? [
  { name: 'TERRA_DEV_ID', value: terraDevId }
  { name: 'TERRA_API_KEY', secretRef: 'terra-api-key' }
  { name: 'TERRA_WEBHOOK_SECRET', secretRef: 'terra-webhook-secret' }
] : []

// Web Push settings, shared by the web app and the reminder job.
var pushEnv = pushEnabled ? [
  { name: 'VAPID_PUBLIC_KEY', value: vapidPublicKey }
  { name: 'VAPID_PRIVATE_KEY', secretRef: 'vapid-private-key' }
  { name: 'VAPID_SUBJECT', value: appUrl }
] : []

var dbEnv = [
  { name: 'DB_SERVER', value: dbServer }
  { name: 'DB_PORT', value: dbPort }
  { name: 'DB_NAME', value: dbName }
  { name: 'DB_USER', value: dbUser }
  { name: 'DB_PASSWORD', secretRef: 'db-password' }
  { name: 'DB_ENCRYPT', value: 'true' }
  { name: 'DB_TRUST_SERVER_CERTIFICATE', value: dbTrustServerCertificate }
]

resource app 'Microsoft.App/containerApps@2024-03-01' = if (deployApp) {
  name: appName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${identity.id}': {} }
  }
  dependsOn: [acrPull, kvSecretsUser]
  properties: {
    environmentId: env.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        { server: acr.properties.loginServer, identity: identity.id }
      ]
      secrets: secrets
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${acr.properties.loginServer}/${webImage}'
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: concat(dbEnv, pushEnv, terraEnv, [
            { name: 'BETTER_AUTH_SECRET', secretRef: 'better-auth-secret' }
            { name: 'BETTER_AUTH_URL', value: appUrl }
          ])
          probes: [
            {
              type: 'Liveness'
              httpGet: { path: '/sign-in', port: 3000 }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: { path: '/sign-in', port: 3000 }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: 3
        rules: [
          { name: 'http', http: { metadata: { concurrentRequests: '50' } } }
        ]
      }
    }
  }
}

// Manually triggered: `az containerapp job start` runs `prisma migrate deploy`
// (override the command to run the seed or make-admin scripts).
resource migrateJob 'Microsoft.App/jobs@2024-03-01' = if (deployApp) {
  name: 'job-${appName}-migrate'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${identity.id}': {} }
  }
  dependsOn: [acrPull, kvSecretsUser]
  properties: {
    environmentId: env.id
    workloadProfileName: 'Consumption'
    configuration: {
      triggerType: 'Manual'
      replicaTimeout: 900
      replicaRetryLimit: 0
      manualTriggerConfig: { parallelism: 1, replicaCompletionCount: 1 }
      registries: [
        { server: acr.properties.loginServer, identity: identity.id }
      ]
      secrets: secrets
    }
    template: {
      containers: [
        {
          name: 'tools'
          image: '${acr.properties.loginServer}/${toolsImage}'
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: concat(dbEnv, pushEnv)
        }
      ]
    }
  }
}

// Evening habit and challenge reminders (scripts/send-reminders.ts).
resource reminderJob 'Microsoft.App/jobs@2024-03-01' = if (deployApp && pushEnabled) {
  name: 'job-${appName}-reminders'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${identity.id}': {} }
  }
  dependsOn: [acrPull, kvSecretsUser]
  properties: {
    environmentId: env.id
    workloadProfileName: 'Consumption'
    configuration: {
      triggerType: 'Schedule'
      replicaTimeout: 900
      replicaRetryLimit: 1
      scheduleTriggerConfig: { cronExpression: reminderCron, parallelism: 1, replicaCompletionCount: 1 }
      registries: [
        { server: acr.properties.loginServer, identity: identity.id }
      ]
      secrets: secrets
    }
    template: {
      containers: [
        {
          name: 'reminders'
          image: '${acr.properties.loginServer}/${toolsImage}'
          command: ['npx', 'tsx', 'scripts/send-reminders.ts']
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: concat(dbEnv, pushEnv)
        }
      ]
    }
  }
}

output acrName string = acr.name
output acrLoginServer string = acr.properties.loginServer
output keyVaultName string = kv.name
output environmentName string = env.name
output appUrl string = appUrl
@description('The single address all app traffic leaves from: allow it through the SQL Server firewall.')
output outboundIp string = natIp.properties.ipAddress
