BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[device_connections] ADD [token_hash] NVARCHAR(64),
[last_value] INT,
[last_day] DATE;

-- CreateIndex
CREATE NONCLUSTERED INDEX [device_connections_token_hash_idx] ON [dbo].[device_connections]([token_hash]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
