# Wellness Platform Market Scan, November 2026

What the leading employee wellness platforms do, written to guide the HealthYou / Reach Your Peak redesign. Details come from vendor pages, help centers, and review aggregators. Aggregator prices often disagree with each other, and anything marked *unverified* needs to be checked with the vendor.

## Contents

- [Key takeaways](#key-takeaways)
- [1. Wellable (main reference)](#1-wellable-main-reference)
- [2. Wellable-style competitors](#2-wellable-style-competitors)
- [3. Wider market](#3-wider-market)
- [4. Market baseline](#4-market-baseline)
- [5. Focus areas and data-model implications](#5-focus-areas-and-data-model-implications)
- [6. Gaps a custom City portal can fill](#6-gaps-a-custom-city-portal-can-fill)
- [Not verified](#not-verified)

## Key takeaways

- **Combine three vendors' strengths.** No vendor offers all three focus areas well:
  - **Wellable** (www.wellable.co): the user experience and points model.
  - **Sprout At Work and Wellness360:** biometric screening and outcome tracking.
  - **Personify Health and Limeade:** content tailored to each person's interests.
- **Personify Health is the local comparison.** El Paso County runs its own "Reach Your Peak" program on it ([leaflet](https://epc-assets.elpasoco.com/wp-content/uploads/sites/2/Employee-Benefits/Document-and-Forms/2026-RETIREE-RYP-Leaflet.pdf)), so City employees may compare against it.
- **Outcome-based rewards come with federal rules.** HIPAA/ACA require a reasonable alternative standard, which means building these rules into the data model from day one. See [section 5C](#c-outcome-based-tracking-and-incentives).

## 1. Wellable (main reference)

### Structure

[Wellable's platform page](https://wellable.co/wellness-platform) groups the product into four sections:

- **Well-Being Hub:** challenges, a year-round incentive program, a Personal Wellness Assessment, and verification of preventive care.
- **Engagement:** community chat, a bulletin board, benefits navigation, device integrations, gamification, and rewards.
- **Measure:** analytics, surveys, and an account manager.
- **Add-ons:** health content, 1,000+ on-demand classes, coaching, onsite services, health fairs, and a Lifestyle Spending Account.

The core platform is sold with paid add-ons on top.

### Points model

From the [point structure help article](https://support.wellable.co/hc/en-us/articles/360013117272-Wellable-Point-Structure):

- **Categories:** Points fall into four categories: Physical Activity, Nutrition, Daily Challenge, and Special Activity. Admins can cap points per category per day.
- **Special Activities:** Admins create custom events, such as a physical or a City event, and assign points when they create them.
- **Monthly reset:** The year-round program resets points every month so that no one falls hopelessly behind.
- **Tiered payouts:** Milestones pay out to a Rewards Wallet, HSA, PTO, or a premium differential.
- **"Break the Bank":** A fixed reward pool is split equally among everyone who reaches the goal.

### Challenges

- **Ready-made library:** 40+ challenges, with new themes each quarter. Each comes with pre-written communications, a suggested reward, and content.
- **Custom builder:** Admins set the length, individual vs team format, and how points are earned.
- **Fair team ranking:** Team leaderboards rank by **average points per member**, so small teams are not at a disadvantage. A hybrid view shows team and individual standings together.
- **Automatic emails:** Weekly updates and final results go out without admin work.
- **No tracker needed:** People without a fitness tracker can log activity manually.

### Personalization

Wellable's personalization is limited:

- **Assessment:** The [Personal Wellness Assessment](https://www.wellable.co/wellness-platform/personal-wellness-assessment.html) has 46 questions across 8 dimensions. It deliberately gives **no score**, only recommendations and content for weaker areas. Employers see de-identified trends.
- **Content:** Content goes out on a schedule (tips, flyers, newsletters). We found **no interest-based targeting**.
- **AI:** None.

### Outcomes

Wellable is **participation-based only**. It does not collect biometrics or reward health results. It does verify preventive care, such as a flu shot or a physical.

### Rewards Wallet

- 800+ gift-card brands.
- Instant delivery and partial redemption.
- Multi-factor sign-in required to redeem.
- Admins can set sending limits.

### Visual language (from Wellable's live CSS)

| Token | Value |
|---|---|
| Text / dark surfaces | Deep navy `#1B1D35` |
| Single accent / calls to action | Orange `#F47920` (hover `#D66E24`, tint `#FFF0E6`) |
| Section backgrounds | Pale blue-gray `#E5EAF4`, `#F9FBFE` |
| Typography | Averta (geometric sans). Fallbacks: Poppins, Lato |
| Shapes | Cards with 8–16px rounded corners, pill-shaped buttons, circular icon badges |
| Shadows | Very soft (`0 15px 35px rgb(0 0 0 / 5%)`), with an accent glow on calls to action |
| Imagery | Phone and device mockups, outline icons |

The overall feel is calm and high-contrast, with mostly white space, one warm accent, and rounded friendly shapes.

## 2. Wellable-style competitors

| | Wellable | Woliba | YuMuuv | Vantage Fit | Sprout At Work | Wellics | Wellness360 |
|---|---|---|---|---|---|---|---|
| Focus | Modular wellness + rewards | Wellness + recognition | Team challenges | Gamified fitness | Wellbeing + challenges (Telus Health) | Wellbeing analytics | Health assessment + biometrics + incentives |
| Personalization | Assessment recommendations | "Personalized resources" | Minimal | Minimal | Content programming | Daily AI wellbeing score | Driven by health assessment |
| Outcomes | Participation only | Not evident | No | No | **Screening booking + result upload** | Index trends | **Biometrics + incentives** |
| Integrations | 22 apps; SSO/HRIS unstated | HealthKit (sync complaints) | Major devices (sync complaints) | Smartwatches | Apple Health, Fitbit, Garmin, **SSO**, EAP | Wearables | Wearables, white-label |
| Price* | ~$1–2 per employee per month | ~$2 per employee per month | ~$1 per user | Conflicting | Not public | $2–5 per employee per month | ~$1,000/yr and up |

\*Prices come from review aggregators.

## 3. Wider market

- **Personify Health** (formerly Virgin Pulse):
  - **Health assessment and programs:** Health Check (a health assessment), step-by-step Journeys, Healthy Habits, and Rewards Cash with levels.
  - **Personalization:** Interests set in the profile, combined with assessment results, drive daily tips and recommendations.
  - **AI:** PercyIQ, which supports human coaches and checks in with members proactively.
- **WebMD ONE / Limeade:**
  - **My Plan:** A Well-Being Assessment recommends activities, which people add to their "My Plan."
  - **Home screen:** Employer-picked **Featured** items are kept separate from **Recommended** items.
  - **Teams integration:** Nudges arrive as cards in Microsoft Teams.
- **Wellhub** (formerly Gympass):
  - **Gym network:** Access to about 100,000 gyms and studios.
  - **AI coach:** In beta since January 2026; it builds weekly routines.
  - **Challenges and badges.**
- **MoveSpring** (Reward Gateway): the widest range of challenge types, namely Streak, Target, Leaderboard, Virtual Race, Stick-to-It (X of Y days), and Group Fundraiser.
- **Health Advocate:**
  - **Personal pathway:** The health assessment sets a personal pathway.
  - **Biometric history:** Onsite screenings feed into the assessment, and results are tracked over time.
- **Mental health:**
  - **Headspace (Ebb):** an AI companion that does not share chats with the employer.
  - **Spring Health (Guide):** an AI that remembers past sessions.
  - **Kona:** check-ins inside Slack.
- **Navigate Wellbeing:**
  - **Similar to Wellable in feel:** a rewards mall, social wall, and personalized pathways.
  - **Colorado public-sector client:** Larimer County uses it.

## 4. Market baseline

### Features everyone has

- Health assessment
- Challenges and leaderboards
- Points that convert to rewards
- Wearable sync and manual logging
- Content library
- Coaching
- Biometric results
- Mobile app
- SSO
- Admin reporting
- Email and push notifications

### Features that set platforms apart

- An AI coach that remembers past conversations
- Daily cards driven by the person's interests and health assessment
- A social feed and peer recognition
- A range of challenge types
- Benefits navigation
- A Lifestyle Spending Account
- Delivery inside Teams or Slack
- Privacy-first messaging about how AI is used

### Common user experience patterns

- **Home screen:** A "Today" stack of cards.
- **Mobile navigation:** A bottom tab bar (Home / Programs / Challenges / Rewards / Profile).
- **Progress display:** Progress rings and points meters.
- **Onboarding:** Connect a device, then pick interests, then an optional assessment.
- **Content sections:** Featured kept separate from Recommended.
- **Motivation:** Streaks and badges.
- **Visual style:** One accent color on calm, neutral backgrounds.

## 5. Focus areas and data-model implications

### A. Personalized content

**Recommended pattern:**

1. **Onboarding:** Ask for 3–5 interests across Body, Life, and Mind, plus one goal per path.
2. **Optional assessment:** Offer it with points as a reward. Use a no-score, multi-dimension style for Life and Mind (like Wellable), and a health assessment plus biometrics for Body.
3. **Home screen:** Put **Featured** (pinned by the City) above **For you**. Each recommended card shows its reason, for example "Because you chose Sleep."
4. **Ranking:** Start with a simple rule-based ranking (tag match + risk flags + not yet completed + recency). Machine learning or an AI model can come later.

**Data model:**

- `UserInterest` linked to `Tag` (a taxonomy where each tag belongs to a path)
- `ContentItem` (type, path, tags, duration, featured window, audience rules)
- `AssessmentTemplate`, `AssessmentResponse`, `DimensionResult`, `RiskFlag`
- `Recommendation` (score, reason_code, and whether it was shown, dismissed, or completed)
- `Habit` and `HabitLog`
- `ConsentRecord`

### B. Challenges

**Recommended pattern:**

- **Challenge types:** Leaderboard, Target with milestones, Streak, Stick-to-It (X of Y days), Virtual Race, and Group goal. Any type can track steps, minutes, distance, or a custom logged metric.
- **Teams:** Rank by average per member and show a hybrid team-plus-individual view. Teams can be assigned by an admin or formed by participants.
- **Admin tools:** A template library that includes communications, and a custom builder for scoring, daily caps, eligibility, and points.

**Data model:**

- `Challenge` (type, metric, unit, dates, scoring_rule, daily_cap, team_mode, eligibility, points, template_id)
- `ChallengeTemplate`, `ChallengeEnrollment`, `Team`, `TeamMembership`
- `ActivityEntry` (metric, value, date, source, verified, sync_id)
- `ChallengeProgress` (per user and per team, per day)
- `Milestone`, `LeaderboardSnapshot`

### C. Outcome-based tracking and incentives

**Rules** ([DOL FAQ Part 74](https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/aca-part-74), [HERO summary](https://hero-health.org/wp-content/uploads/2017/07/FS_Incentives_guidance_at-a-glance_FINAL_071612.pdf)):

- **Reward cap:** Rewards tied to health results are capped at **30%** of the cost of coverage, or **50%** when tobacco is included.
- **Reasonable alternative standard:** Programs must offer one, for example a coaching program or a doctor's note.
  - It must be disclosed in plan materials *and* in every "target not met" notice.
  - Completing it earns the **same full reward**.
- **EEOC rules:** The EEOC's ADA/GINA incentive rules are still unsettled ([SHRM](https://www.shrm.org/topics-tools/employment-law-compliance/wellness-programs-limbo-without-eeoc-regulations)). **Confirm with City counsel.**
- **Reward progress:** Best practice rewards *improvement* (for example, a 5% gain), not only reaching the target.
- **Rarely used:** Only about 7% of large employers use outcome-based incentives ([KFF](https://www.kff.org/private-insurance/issue-brief/trends-in-workplace-wellness-programs-and-evolving-federal-standards)).

**User experience:**

- **Biometric tiles:** Each tile shows the person's value against the target range, with a trend across screenings.
- **Status:** Each measure shows met, improved, or alternative in progress.
- **Alternative link:** The link to the alternative standard sits next to every measure that missed its target.
- **Risk tier:** Shown with the change from last year.

**Employer reporting:**

- **Aggregate only:** Show results only for groups of at least 10–20 people.
- **Measures:** Participation, movement between risk tiers, average change per measure, completed alternatives, and points awarded compared with spend.

**Data model:**

- `ScreeningEvent` and `BiometricResult` (marker, value, unit, range, source, verified_by)
- `IncentiveRule` (plan_year, marker, target, improvement %, points, participatory vs health-contingent, alt_standard_id)
- `AlternativeStandard` and `AlternativeRequest`
- `RiskScore`
- `PointsLedger` (append-only; with source, rule, category, plan year, and cap bucket)
- `IncentiveCapConfig`, `RewardRedemption`
- `AggregateReport`, with a minimum group size (k-anonymity)
- `AuditLog` for access to protected health information

Tying rewards to the health plan probably means HIPAA business associate obligations.

## 6. Gaps a custom City portal can fill

1. **Combine strengths:** Wellable-quality design and points mechanics, **plus** the outcome tracking Wellable lacks.
2. **Be transparent:**
   - A plain-language rules page.
   - A visible path to the alternative standard.
   - A clear statement of "what the City can't see."
3. **Explainable personalization:** Interest-driven recommendations that show their reasons, with no black-box clinical AI.
4. **Local content:**
   - City facilities.
   - Trails.
   - Pikes Peak events.
   - Department-vs-department challenges.
   - Content for retirees.
5. **Reliable device sync:** Sync failures are the most common complaint about Woliba and YuMuuv. Show "last synced," allow manual backfill, and connect through Apple Health / Health Connect or an aggregator API such as Terra or Validic.
6. **Accessible progressive web app:**
   - WCAG 2.2 AA.
   - Dark mode.
   - Fast on low-end phones.

## Not verified

- Wellable's SSO, HRIS, and API support
- Wellable's in-app tab structure
- Wellable's points-to-dollars rate
- Vantage Fit's AI coach
- The date of Personify's 2026 refresh
- The current EEOC rule status
- The details of the City's current Reach Your Peak program design
