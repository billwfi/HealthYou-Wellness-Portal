BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[biometric_goals] (
    [user_id] NVARCHAR(64) NOT NULL,
    [marker] NVARCHAR(50) NOT NULL,
    [target] DECIMAL(8,2) NOT NULL,
    [direction] NVARCHAR(10) NOT NULL,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [biometric_goals_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [biometric_goals_pkey] PRIMARY KEY CLUSTERED ([user_id],[marker])
);

-- AddForeignKey
ALTER TABLE [dbo].[biometric_goals] ADD CONSTRAINT [biometric_goals_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

