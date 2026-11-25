# HealthYou Redesign Plan

**Status:** Phases 0–1 deployed; Phase 2 in progress, 2026-11-25 · **Branch:** `redesign/modern-platform`
**Research:** [docs/research/2026-11-market-scan.md](research/2026-11-market-scan.md)

## Decisions (2026-11-24)

- **Branding:** keep Reach Your Peak and the City colors (blue for primary actions, red used sparingly as an accent).
- **Rewards:** participation-based only. Points come from taking part, not from health results, so the outcome-based incentive pieces are out of scope: health-contingent rules, the reasonable-alternative-standard workflow, and the 30% cap tracking. Biometrics remain for personal tracking, and completing a screening earns points.
- **Auth:** Better Auth with email and password. Microsoft Entra single sign-on can be switched on through environment variables once the City confirms its identity provider.

## Goal

Keep everything the current Reach Your Peak portal offers. Rebuild it as a modern, Wellable-style platform built around three things:

1. **Personalized content.** What each person sees is driven by the interests they pick at registration, their profile, and an optional assessment.
2. **Challenges.** A full challenge system: several challenge types, fair team scoring, and admin templates.
3. **Progress tracking.** Activity, habits and biometric trends shown against personal goals, with participation points recorded in a ledger and de-identified reporting for the City.

## Where the current build stands (commit 4b3917f)

The current build is a visual copy of the existing portal: about 25 pages, with most of the content hard-coded.

- **Database.** [schema.sql](../schema.sql) defines the tables, but no page reads from or writes to the database.
- **Login.** Nothing is set up. `next-auth@4` and `@auth/core@0.34` are both installed, and they don't work together.
- **Forms.** No form saves anything. There is no `.env` file.

**Decision:** treat the existing pages as the list of features to carry over. Don't try to keep their code. Rebuild on this branch, page area by page area.

## Information architecture

| Member nav (bottom tabs on mobile, sidebar on desktop) | Contents |
|---|---|
| **Today** | Featured cards pinned by the City, then a "For you" feed with the reason for each card ("Because you chose Sleep"), habits to check off, current challenge progress, and a points meter |
| **Explore** | The Body, Life and Mind paths: content, coaching, UCCS programs, Food & Mood, events and webinars |
| **Challenges** | Challenges you've joined and ones open to join, live leaderboards, your team |
| **Progress** | Activity log, device sync status, biometrics compared with targets, outcome status, alternative-standard requests |
| **Rewards** | Points wallet, milestones, how to earn points, the plain-language rules and privacy page |
| Profile | Interests, goals, connected devices, consent and privacy settings |

**Admin console** (`/admin`):
- Challenge builder and template library
- Content and tag management, plus the featured schedule
- Incentive rules and caps
- Screening imports
- Alternative-standard queue
- Aggregate reports, only for groups of at least 10 people

## Design direction

The look follows Wellable, under City branding:

- **Colors.** Calm neutral backgrounds (white and pale blue-gray), deep navy text, and **one** warm accent for calls to action. We keep City red and blue as brand colors but use them sparingly.
- **Typography.** A geometric sans, loaded with `next/font`. Candidates: Inter, Plus Jakarta Sans, or Figtree.
- **Shapes.** Rounded cards (12–16px), pill-shaped buttons, very soft shadows, progress rings, outline icons (lucide).
- **Design tokens.** Colors, spacing and type are defined once as Tailwind v4 `@theme` tokens. Light and dark mode come from the same tokens.
- **Accessibility and mobile.** WCAG 2.2 AA, mobile-first, and installable as a progressive web app (PWA).

## Tech choices (proposed)

| Concern | Proposal | Why |
|---|---|---|
| Framework | Next.js 16 App Router, Server Components, Server Actions | Already in place. Note that `middleware` is now [`proxy.ts`](../node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md) |
| Database | **Microsoft SQL Server 2022** (`WellnessPortal`) + **Prisma 7**, with migrations | The City's server. Prisma has mature SQL Server support and a Better Auth adapter. Replaces the hand-run `schema.sql` |
| Auth | **Auth.js v5 or Better Auth**. Microsoft Entra ID SSO for employees, email magic link for spouses and retirees | Fixes the mismatched v4/v5 install. *Needs confirming: what identity provider the City uses* |
| UI kit | shadcn/ui (Radix) on Tailwind v4, plus lucide icons | Accessible building blocks styled with our tokens |
| Validation | Zod | Checks Server Action input |
| Charts | Recharts or visx | Biometric trend charts and progress rings |
| Device data | Phase 1: manual entry and CSV import. Later: an aggregator (Terra, Validic, or Rook) for Apple Health, Health Connect, Fitbit and Garmin | Building direct integrations ourselves is costly |
| Hosting | Netlify (current) | Unchanged |

## Data model v2 (summary)

**Identity**
- `users`
- `user_profiles`: department, member type (employee, spouse or retiree), path goals
- `consents`

**Personalization**
- `tags`: each tag belongs to a path (Body, Life or Mind)
- `user_interests`
- `content_items`
- `content_tags`
- `recommendations`: score, reason_code, and whether it was shown, dismissed or completed
- `assessments`
- `assessment_responses`
- `risk_flags`
- `habits`
- `habit_logs`

**Activity**
- `activity_entries`: metric, value, unit, source, verified, sync_id
- `device_connections`: provider, last synced

**Challenges**
- `challenge_templates`
- `challenges`: type is one of leaderboard, target, streak, stick-to-it, race or group. Also metric, scoring rule, daily cap, team mode, eligibility and points
- `teams`
- `team_members`
- `challenge_enrollments`
- `challenge_progress_daily`
- `milestones`

**Outcomes**
- `screening_events`
- `biometric_results`: one row per marker, holding value, unit, range, source and who verified it
- `incentive_rules`: participatory or health-contingent; target, required improvement %, and the linked alternative standard
- `alternative_standards`
- `alternative_requests`
- `risk_scores`

**Points**
- `points_ledger`: append-only; holds the source, rule, category, plan year and cap bucket
- `incentive_caps`
- `reward_redemptions`

**Admin**
- `audit_log`: records every access to health information
- `events`
- `polls`

## Phases

**Phase 0: Foundation (start here)**
- Install Drizzle and write the v2 schema and migrations, with seed data.
- Set up login and protect routes in `proxy.ts`.
- Define the design tokens and app shell: navigation, light and dark mode, and the base components.
- Move the README over to describe this project.

**Phase 1: Onboarding and personalized Today**
- Registration, then an interest picker (Body, Life, Mind), then path goals.
- Content tagging, and the rule-based recommendations behind the "For you" feed.
- The Today page, and Explore pages that read from the database.

Built so far (2026-11-25): four-step onboarding at /welcome (member type, interests, a goal per path, up to 5 habits), editable from Profile; rule-based "For you" feed with a reason on every pick (featured, then interest matches, then goal path; completed and dismissed items drop out; at most half from one path); habit check-ins with streaks and capped points; Explore filtered by path, topic and saved, with detail pages and "Mark complete" (capped points). Admin content editor added (list with status/path/search filters, create/edit with topics, featured window and draft/published, delete with confirmation, audit log); each item sets its own completion points within the daily cap. Events added: "Upcoming events" on Today, an /events page grouped by month, add-to-calendar .ics downloads (Mountain Time), and an admin events editor (upcoming/past, create/edit/delete, audit log). Phase 1 feature-complete.

**Phase 2: Activity and challenges**
- Logging activity, with each category's daily cap applied.
- The challenge engine: start with leaderboard, target and streak.
- Team leaderboards ranked by average points per member.
- Admin challenge builder and template library.

Built so far (2026-11-25): activity logging on /progress (7-day backfill, per-category daily point caps, delete own entries); challenge engine that recomputes per-day progress whenever activity or habits change (leaderboard, target, race, streak, stick-to-it, group goal; daily caps; late joiners get credit from the start); join solo, start or join a team; individual and team leaderboards (teams by average per member; names shown as first name + last initial); goal types complete and award points automatically, leaderboard/group types award everyone who took part when an admin finishes the challenge; admin builder with template library, draft/publish, recalculation when scoring changes, archive vs delete. Still to do: milestones, eligibility rules, team captain tools.

**Phase 3: Progress and rewards**
- Screening import and biometric results (completing a screening earns points).
- Points rules engine with daily and yearly caps, written to the points ledger.
- Progress page: activity, habit streaks and biometric trends against personal goals.
- Reward tiers, redemption requests and the rewards wallet.

**Phase 4: Reporting, sync and polish**
- Aggregate reports for the City, de-identified, only for groups of at least 10.
- Device aggregator integration.
- PWA install support and push notifications.
- Accessibility audit.

## Open questions for the City / program owner

1. **Branding.** Keep "Reach Your Peak" and City colors, or present this as a new "HealthYou" brand?
2. **Login.** Do City employees sign in through Microsoft Entra ID (formerly Azure AD)? Are spouses and retirees eligible?
3. **Outcome-based incentives.** Will rewards actually depend on biometric targets? If so, legal counsel needs to review the 30% cap, the reasonable alternative standard, and whether HIPAA business-associate obligations apply.
4. **Rewards.** Gift cards, a premium differential, HSA contributions, or PTO? Who pays them out?
5. **Screening data.** Who is the screening vendor, and what format do results come in (CSV, HL7, PDF)? Does UCCS supply them?
6. **Devices.** Is there budget for a device aggregator (Terra, Validic or Rook), or is manual entry plus Apple Health and Health Connect enough for launch?
