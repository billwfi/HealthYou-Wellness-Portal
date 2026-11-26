BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[member_profiles] ADD [notify_news] BIT NOT NULL CONSTRAINT [member_profiles_notify_news_df] DEFAULT 1,
[notify_reminders] BIT NOT NULL CONSTRAINT [member_profiles_notify_reminders_df] DEFAULT 1;

-- CreateTable
CREATE TABLE [dbo].[push_subscriptions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(64) NOT NULL,
    [endpoint_hash] NVARCHAR(64) NOT NULL,
    [endpoint] NVARCHAR(2000) NOT NULL,
    [p256dh] NVARCHAR(200) NOT NULL,
    [auth] NVARCHAR(100) NOT NULL,
    [user_agent] NVARCHAR(500),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [push_subscriptions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [last_success_at] DATETIME2,
    CONSTRAINT [push_subscriptions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [push_subscriptions_endpoint_hash_key] UNIQUE NONCLUSTERED ([endpoint_hash])
);

-- CreateTable
CREATE TABLE [dbo].[push_messages] (
    [id] INT NOT NULL IDENTITY(1,1),
    [kind] NVARCHAR(20) NOT NULL,
    [title] NVARCHAR(100) NOT NULL,
    [body] NVARCHAR(300) NOT NULL,
    [url] NVARCHAR(500),
    [audience] NVARCHAR(max),
    [sent_by] NVARCHAR(64),
    [recipients] INT NOT NULL CONSTRAINT [push_messages_recipients_df] DEFAULT 0,
    [delivered] INT NOT NULL CONSTRAINT [push_messages_delivered_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [push_messages_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [push_messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [push_subscriptions_user_id_idx] ON [dbo].[push_subscriptions]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [push_messages_created_at_idx] ON [dbo].[push_messages]([created_at]);

-- AddForeignKey
ALTER TABLE [dbo].[push_subscriptions] ADD CONSTRAINT [push_subscriptions_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

