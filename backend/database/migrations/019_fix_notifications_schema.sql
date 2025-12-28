-- Fix notifications table schema
-- Rename 'read' column to 'is_read' to match application code expectations

-- Check if column needs to be renamed (handle both cases)
DO $$
BEGIN
  -- Try to rename read to is_read if read exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    ALTER TABLE notifications RENAME COLUMN "read" TO is_read;
    RAISE NOTICE 'Successfully renamed read column to is_read';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'is_read'
  ) THEN
    RAISE NOTICE 'Column is_read already exists, no action needed';
  ELSE
    RAISE NOTICE 'No read or is_read column found in notifications table';
  END IF;
END $$;

-- Ensure is_read column has correct default value
ALTER TABLE notifications ALTER COLUMN is_read SET DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN notifications.is_read IS 'Indicates if the notification has been read by the user (false = unread, true = read)';
