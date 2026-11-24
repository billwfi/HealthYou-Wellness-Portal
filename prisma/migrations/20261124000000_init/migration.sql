BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[user] (
    [id] NVARCHAR(64) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(320) NOT NULL,
    [email_verified] BIT NOT NULL CONSTRAINT [user_email_verified_df] DEFAULT 0,
    [image] NVARCHAR(1000),
    [first_name] NVARCHAR(100),
    [last_name] NVARCHAR(100),
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [user_role_df] DEFAULT 'member',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [user_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [user_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [user_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[session] (
    [id] NVARCHAR(64) NOT NULL,
    [token] NVARCHAR(255) NOT NULL,
    [expires_at] DATETIME2 NOT NULL,
    [ip_address] NVARCHAR(64),
    [user_agent] NVARCHAR(1000),
    [user_id] NVARCHAR(64) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [session_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [session_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [session_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[account] (
    [id] NVARCHAR(64) NOT NULL,
    [account_id] NVARCHAR(255) NOT NULL,
    [provider_id] NVARCHAR(64) NOT NULL,
    [user_id] NVARCHAR(64) NOT NULL,
    [access_token] NVARCHAR(max),
    [refresh_token] NVARCHAR(max),
    [id_token] NVARCHAR(max),
    [access_token_expires_at] DATETIME2,
    [refresh_token_expires_at] DATETIME2,
    [scope] NVARCHAR(1000),
    [password] NVARCHAR(255),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [account_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [account_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [account_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[verification] (
    [id] NVARCHAR(64) NOT NULL,
    [identifier] NVARCHAR(255) NOT NULL,
    [value] NVARCHAR(max) NOT NULL,
    [expires_at] DATETIME2 NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [verification_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [verification_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [verification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[member_profiles] (
    [user_id] NVARCHAR(64) NOT NULL,
    [employee_id] NVARCHAR(50),
    [department] NVARCHAR(200),
    [member_type] NVARCHAR(20) NOT NULL CONSTRAINT [member_profiles_member_type_df] DEFAULT 'employee',
    [timezone] NVARCHAR(64) NOT NULL CONSTRAINT [member_profiles_timezone_df] DEFAULT 'America/Denver',
    [onboarded_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [member_profiles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [member_profiles_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [member_profiles_pkey] PRIMARY KEY CLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[tags] (
    [id] INT NOT NULL IDENTITY(1,1),
    [slug] NVARCHAR(100) NOT NULL,
    [label] NVARCHAR(200) NOT NULL,
    [path] NVARCHAR(10) NOT NULL,
    [description] NVARCHAR(1000),
    [sort_order] INT NOT NULL CONSTRAINT [tags_sort_order_df] DEFAULT 0,
    CONSTRAINT [tags_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [tags_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[user_interests] (
    [user_id] NVARCHAR(64) NOT NULL,
    [tag_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [user_interests_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [user_interests_pkey] PRIMARY KEY CLUSTERED ([user_id],[tag_id])
);

-- CreateTable
CREATE TABLE [dbo].[path_goals] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [path] NVARCHAR(10) NOT NULL,
    [goal] NVARCHAR(500) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [path_goals_status_df] DEFAULT 'active',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [path_goals_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [path_goals_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [path_goals_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [path_goals_user_id_path_key] UNIQUE NONCLUSTERED ([user_id],[path])
);

-- CreateTable
CREATE TABLE [dbo].[consents] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [kind] NVARCHAR(50) NOT NULL,
    [version] NVARCHAR(20) NOT NULL,
    [granted] BIT NOT NULL,
    [metadata] NVARCHAR(max),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [consents_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [consents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[content_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [slug] NVARCHAR(150) NOT NULL,
    [title] NVARCHAR(300) NOT NULL,
    [summary] NVARCHAR(1000),
    [body] NVARCHAR(max),
    [type] NVARCHAR(20) NOT NULL,
    [path] NVARCHAR(10) NOT NULL,
    [provider] NVARCHAR(200),
    [url] NVARCHAR(1000),
    [image_url] NVARCHAR(1000),
    [duration_minutes] INT,
    [points] INT NOT NULL CONSTRAINT [content_items_points_df] DEFAULT 0,
    [featured_from] DATE,
    [featured_until] DATE,
    [published_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [content_items_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [content_items_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [content_items_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [content_items_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[content_tags] (
    [content_id] INT NOT NULL,
    [tag_id] INT NOT NULL,
    CONSTRAINT [content_tags_pkey] PRIMARY KEY CLUSTERED ([content_id],[tag_id])
);

-- CreateTable
CREATE TABLE [dbo].[content_interactions] (
    [user_id] NVARCHAR(64) NOT NULL,
    [content_id] INT NOT NULL,
    [viewed_at] DATETIME2,
    [completed_at] DATETIME2,
    [saved_at] DATETIME2,
    [dismissed_at] DATETIME2,
    CONSTRAINT [content_interactions_pkey] PRIMARY KEY CLUSTERED ([user_id],[content_id])
);

-- CreateTable
CREATE TABLE [dbo].[habits] (
    [id] INT NOT NULL IDENTITY(1,1),
    [slug] NVARCHAR(100) NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(1000),
    [path] NVARCHAR(10) NOT NULL,
    [tag_id] INT,
    [points] INT NOT NULL CONSTRAINT [habits_points_df] DEFAULT 5,
    [is_active] BIT NOT NULL CONSTRAINT [habits_is_active_df] DEFAULT 1,
    CONSTRAINT [habits_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [habits_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[user_habits] (
    [user_id] NVARCHAR(64) NOT NULL,
    [habit_id] INT NOT NULL,
    [active] BIT NOT NULL CONSTRAINT [user_habits_active_df] DEFAULT 1,
    [started_at] DATETIME2 NOT NULL CONSTRAINT [user_habits_started_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [user_habits_pkey] PRIMARY KEY CLUSTERED ([user_id],[habit_id])
);

-- CreateTable
CREATE TABLE [dbo].[habit_logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [habit_id] INT NOT NULL,
    [log_date] DATE NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [habit_logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [habit_logs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [habit_logs_user_id_habit_id_log_date_key] UNIQUE NONCLUSTERED ([user_id],[habit_id],[log_date])
);

-- CreateTable
CREATE TABLE [dbo].[assessments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [slug] NVARCHAR(100) NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [version] INT NOT NULL CONSTRAINT [assessments_version_df] DEFAULT 1,
    [dimensions] NVARCHAR(max) NOT NULL,
    [questions] NVARCHAR(max) NOT NULL,
    [points] INT NOT NULL CONSTRAINT [assessments_points_df] DEFAULT 0,
    [is_active] BIT NOT NULL CONSTRAINT [assessments_is_active_df] DEFAULT 1,
    CONSTRAINT [assessments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [assessments_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[assessment_responses] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [assessment_id] INT NOT NULL,
    [answers] NVARCHAR(max) NOT NULL,
    [dimension_results] NVARCHAR(max),
    [completed_at] DATETIME2 NOT NULL CONSTRAINT [assessment_responses_completed_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [assessment_responses_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[activity_types] (
    [id] INT NOT NULL IDENTITY(1,1),
    [slug] NVARCHAR(100) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [category] NVARCHAR(30) NOT NULL,
    [metric] NVARCHAR(30) NOT NULL,
    [unit] NVARCHAR(20) NOT NULL,
    [points_per_unit] DECIMAL(8,4) NOT NULL CONSTRAINT [activity_types_points_per_unit_df] DEFAULT 0,
    [is_active] BIT NOT NULL CONSTRAINT [activity_types_is_active_df] DEFAULT 1,
    CONSTRAINT [activity_types_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [activity_types_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[activity_entries] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [activity_type_id] INT NOT NULL,
    [entry_date] DATE NOT NULL,
    [value] DECIMAL(12,2) NOT NULL,
    [source] NVARCHAR(20) NOT NULL CONSTRAINT [activity_entries_source_df] DEFAULT 'manual',
    [external_id] NVARCHAR(200),
    [verified] BIT NOT NULL CONSTRAINT [activity_entries_verified_df] DEFAULT 0,
    [notes] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [activity_entries_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [activity_entries_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[device_connections] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [provider] NVARCHAR(50) NOT NULL,
    [external_user_id] NVARCHAR(200),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [device_connections_status_df] DEFAULT 'connected',
    [last_synced_at] DATETIME2,
    [last_error] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [device_connections_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [device_connections_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [device_connections_user_id_provider_key] UNIQUE NONCLUSTERED ([user_id],[provider])
);

-- CreateTable
CREATE TABLE [dbo].[biometric_screenings] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [screened_on] DATE NOT NULL,
    [source] NVARCHAR(30) NOT NULL CONSTRAINT [biometric_screenings_source_df] DEFAULT 'self_reported',
    [verified_by] NVARCHAR(200),
    [verified_at] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [biometric_screenings_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [biometric_screenings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[biometric_results] (
    [id] INT NOT NULL IDENTITY(1,1),
    [screening_id] INT NOT NULL,
    [marker] NVARCHAR(50) NOT NULL,
    [value] DECIMAL(8,2) NOT NULL,
    [unit] NVARCHAR(20) NOT NULL,
    CONSTRAINT [biometric_results_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [biometric_results_screening_id_marker_key] UNIQUE NONCLUSTERED ([screening_id],[marker])
);

-- CreateTable
CREATE TABLE [dbo].[challenge_templates] (
    [id] INT NOT NULL IDENTITY(1,1),
    [slug] NVARCHAR(100) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(1000),
    [type] NVARCHAR(20) NOT NULL,
    [metric] NVARCHAR(30) NOT NULL,
    [unit] NVARCHAR(20) NOT NULL,
    [goal_value] DECIMAL(12,2),
    [duration_days] INT NOT NULL CONSTRAINT [challenge_templates_duration_days_df] DEFAULT 28,
    [image_url] NVARCHAR(1000),
    [communications] NVARCHAR(max),
    CONSTRAINT [challenge_templates_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [challenge_templates_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[challenges] (
    [id] INT NOT NULL IDENTITY(1,1),
    [template_id] INT,
    [slug] NVARCHAR(150) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(1000),
    [type] NVARCHAR(20) NOT NULL,
    [metric] NVARCHAR(30) NOT NULL,
    [unit] NVARCHAR(20) NOT NULL,
    [goal_value] DECIMAL(12,2),
    [daily_goal] DECIMAL(12,2),
    [daily_cap] DECIMAL(12,2),
    [start_date] DATE NOT NULL,
    [end_date] DATE NOT NULL,
    [team_mode] NVARCHAR(20) NOT NULL CONSTRAINT [challenges_team_mode_df] DEFAULT 'individual',
    [min_team_size] INT,
    [max_team_size] INT,
    [points_on_completion] INT NOT NULL CONSTRAINT [challenges_points_on_completion_df] DEFAULT 0,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [challenges_status_df] DEFAULT 'draft',
    [image_url] NVARCHAR(1000),
    [eligibility] NVARCHAR(max),
    [created_by] NVARCHAR(64),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [challenges_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [challenges_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [challenges_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [challenges_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[challenge_milestones] (
    [id] INT NOT NULL IDENTITY(1,1),
    [challenge_id] INT NOT NULL,
    [threshold] DECIMAL(12,2) NOT NULL,
    [label] NVARCHAR(200) NOT NULL,
    [points] INT NOT NULL CONSTRAINT [challenge_milestones_points_df] DEFAULT 0,
    CONSTRAINT [challenge_milestones_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[teams] (
    [id] INT NOT NULL IDENTITY(1,1),
    [challenge_id] INT,
    [name] NVARCHAR(200) NOT NULL,
    [department] NVARCHAR(200),
    [captain_id] NVARCHAR(64),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [teams_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [teams_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[team_members] (
    [team_id] INT NOT NULL,
    [user_id] NVARCHAR(64) NOT NULL,
    [joined_at] DATETIME2 NOT NULL CONSTRAINT [team_members_joined_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [team_members_pkey] PRIMARY KEY CLUSTERED ([team_id],[user_id])
);

-- CreateTable
CREATE TABLE [dbo].[challenge_enrollments] (
    [challenge_id] INT NOT NULL,
    [user_id] NVARCHAR(64) NOT NULL,
    [team_id] INT,
    [enrolled_at] DATETIME2 NOT NULL CONSTRAINT [challenge_enrollments_enrolled_at_df] DEFAULT CURRENT_TIMESTAMP,
    [completed_at] DATETIME2,
    CONSTRAINT [challenge_enrollments_pkey] PRIMARY KEY CLUSTERED ([challenge_id],[user_id])
);

-- CreateTable
CREATE TABLE [dbo].[challenge_progress_daily] (
    [id] INT NOT NULL IDENTITY(1,1),
    [challenge_id] INT NOT NULL,
    [user_id] NVARCHAR(64) NOT NULL,
    [day] DATE NOT NULL,
    [value] DECIMAL(12,2) NOT NULL CONSTRAINT [challenge_progress_daily_value_df] DEFAULT 0,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [challenge_progress_daily_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [challenge_progress_daily_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [challenge_progress_daily_challenge_id_user_id_day_key] UNIQUE NONCLUSTERED ([challenge_id],[user_id],[day])
);

-- CreateTable
CREATE TABLE [dbo].[points_rules] (
    [id] INT NOT NULL IDENTITY(1,1),
    [plan_year] INT NOT NULL,
    [slug] NVARCHAR(100) NOT NULL,
    [label] NVARCHAR(200) NOT NULL,
    [category] NVARCHAR(30) NOT NULL,
    [points] INT NOT NULL,
    [max_per_day] INT,
    [max_per_year] INT,
    [is_active] BIT NOT NULL CONSTRAINT [points_rules_is_active_df] DEFAULT 1,
    CONSTRAINT [points_rules_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [points_rules_plan_year_slug_key] UNIQUE NONCLUSTERED ([plan_year],[slug])
);

-- CreateTable
CREATE TABLE [dbo].[points_ledger] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [plan_year] INT NOT NULL,
    [category] NVARCHAR(30) NOT NULL,
    [points] INT NOT NULL,
    [rule_id] INT,
    [source_type] NVARCHAR(50) NOT NULL,
    [source_id] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(500) NOT NULL,
    [occurred_on] DATE NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [points_ledger_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [points_ledger_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [points_ledger_user_id_source_type_source_id_key] UNIQUE NONCLUSTERED ([user_id],[source_type],[source_id])
);

-- CreateTable
CREATE TABLE [dbo].[reward_tiers] (
    [id] INT NOT NULL IDENTITY(1,1),
    [plan_year] INT NOT NULL,
    [threshold] INT NOT NULL,
    [label] NVARCHAR(100) NOT NULL,
    [reward] NVARCHAR(300) NOT NULL,
    [sort_order] INT NOT NULL CONSTRAINT [reward_tiers_sort_order_df] DEFAULT 0,
    CONSTRAINT [reward_tiers_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[reward_redemptions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [tier_id] INT,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [reward_redemptions_status_df] DEFAULT 'pending',
    [details] NVARCHAR(max),
    [requested_at] DATETIME2 NOT NULL CONSTRAINT [reward_redemptions_requested_at_df] DEFAULT CURRENT_TIMESTAMP,
    [fulfilled_at] DATETIME2,
    CONSTRAINT [reward_redemptions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[events] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(300) NOT NULL,
    [provider] NVARCHAR(200),
    [description] NVARCHAR(max),
    [event_date] DATE NOT NULL,
    [start_time] TIME,
    [end_time] TIME,
    [location] NVARCHAR(300),
    [url] NVARCHAR(1000),
    [event_type] NVARCHAR(30) NOT NULL CONSTRAINT [events_event_type_df] DEFAULT 'webinar',
    [points] INT NOT NULL CONSTRAINT [events_points_df] DEFAULT 0,
    CONSTRAINT [events_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[audit_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [actor_id] NVARCHAR(64),
    [action] NVARCHAR(100) NOT NULL,
    [entity] NVARCHAR(100) NOT NULL,
    [entity_id] NVARCHAR(100),
    [metadata] NVARCHAR(max),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [audit_log_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [audit_log_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [session_user_id_idx] ON [dbo].[session]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [account_user_id_idx] ON [dbo].[account]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [verification_identifier_idx] ON [dbo].[verification]([identifier]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [consents_user_id_idx] ON [dbo].[consents]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [assessment_responses_user_id_idx] ON [dbo].[assessment_responses]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [activity_entries_user_id_entry_date_idx] ON [dbo].[activity_entries]([user_id], [entry_date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [biometric_screenings_user_id_idx] ON [dbo].[biometric_screenings]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [challenges_start_date_end_date_idx] ON [dbo].[challenges]([start_date], [end_date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [challenge_enrollments_user_id_idx] ON [dbo].[challenge_enrollments]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [points_ledger_user_id_plan_year_idx] ON [dbo].[points_ledger]([user_id], [plan_year]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [events_event_date_idx] ON [dbo].[events]([event_date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_log_entity_entity_id_idx] ON [dbo].[audit_log]([entity], [entity_id]);

-- AddForeignKey
ALTER TABLE [dbo].[session] ADD CONSTRAINT [session_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[account] ADD CONSTRAINT [account_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[member_profiles] ADD CONSTRAINT [member_profiles_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_interests] ADD CONSTRAINT [user_interests_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_interests] ADD CONSTRAINT [user_interests_tag_id_fkey] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[tags]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[path_goals] ADD CONSTRAINT [path_goals_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[consents] ADD CONSTRAINT [consents_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[content_tags] ADD CONSTRAINT [content_tags_content_id_fkey] FOREIGN KEY ([content_id]) REFERENCES [dbo].[content_items]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[content_tags] ADD CONSTRAINT [content_tags_tag_id_fkey] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[tags]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[content_interactions] ADD CONSTRAINT [content_interactions_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[content_interactions] ADD CONSTRAINT [content_interactions_content_id_fkey] FOREIGN KEY ([content_id]) REFERENCES [dbo].[content_items]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[habits] ADD CONSTRAINT [habits_tag_id_fkey] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[tags]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_habits] ADD CONSTRAINT [user_habits_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_habits] ADD CONSTRAINT [user_habits_habit_id_fkey] FOREIGN KEY ([habit_id]) REFERENCES [dbo].[habits]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[habit_logs] ADD CONSTRAINT [habit_logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[habit_logs] ADD CONSTRAINT [habit_logs_habit_id_fkey] FOREIGN KEY ([habit_id]) REFERENCES [dbo].[habits]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[assessment_responses] ADD CONSTRAINT [assessment_responses_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[assessment_responses] ADD CONSTRAINT [assessment_responses_assessment_id_fkey] FOREIGN KEY ([assessment_id]) REFERENCES [dbo].[assessments]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activity_entries] ADD CONSTRAINT [activity_entries_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activity_entries] ADD CONSTRAINT [activity_entries_activity_type_id_fkey] FOREIGN KEY ([activity_type_id]) REFERENCES [dbo].[activity_types]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[device_connections] ADD CONSTRAINT [device_connections_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[biometric_screenings] ADD CONSTRAINT [biometric_screenings_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[biometric_results] ADD CONSTRAINT [biometric_results_screening_id_fkey] FOREIGN KEY ([screening_id]) REFERENCES [dbo].[biometric_screenings]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[challenges] ADD CONSTRAINT [challenges_template_id_fkey] FOREIGN KEY ([template_id]) REFERENCES [dbo].[challenge_templates]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[challenge_milestones] ADD CONSTRAINT [challenge_milestones_challenge_id_fkey] FOREIGN KEY ([challenge_id]) REFERENCES [dbo].[challenges]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[teams] ADD CONSTRAINT [teams_challenge_id_fkey] FOREIGN KEY ([challenge_id]) REFERENCES [dbo].[challenges]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[teams] ADD CONSTRAINT [teams_captain_id_fkey] FOREIGN KEY ([captain_id]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[team_members] ADD CONSTRAINT [team_members_team_id_fkey] FOREIGN KEY ([team_id]) REFERENCES [dbo].[teams]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[team_members] ADD CONSTRAINT [team_members_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[challenge_enrollments] ADD CONSTRAINT [challenge_enrollments_challenge_id_fkey] FOREIGN KEY ([challenge_id]) REFERENCES [dbo].[challenges]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[challenge_enrollments] ADD CONSTRAINT [challenge_enrollments_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[challenge_enrollments] ADD CONSTRAINT [challenge_enrollments_team_id_fkey] FOREIGN KEY ([team_id]) REFERENCES [dbo].[teams]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[challenge_progress_daily] ADD CONSTRAINT [challenge_progress_daily_challenge_id_fkey] FOREIGN KEY ([challenge_id]) REFERENCES [dbo].[challenges]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[challenge_progress_daily] ADD CONSTRAINT [challenge_progress_daily_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[points_ledger] ADD CONSTRAINT [points_ledger_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[points_ledger] ADD CONSTRAINT [points_ledger_rule_id_fkey] FOREIGN KEY ([rule_id]) REFERENCES [dbo].[points_rules]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reward_redemptions] ADD CONSTRAINT [reward_redemptions_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reward_redemptions] ADD CONSTRAINT [reward_redemptions_tier_id_fkey] FOREIGN KEY ([tier_id]) REFERENCES [dbo].[reward_tiers]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- Hand-written: device re-syncs are idempotent, manual entries (NULL external_id) are unrestricted.
CREATE UNIQUE NONCLUSTERED INDEX [activity_entries_user_source_external_key]
    ON [dbo].[activity_entries]([user_id], [source], [external_id])
    WHERE [external_id] IS NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

