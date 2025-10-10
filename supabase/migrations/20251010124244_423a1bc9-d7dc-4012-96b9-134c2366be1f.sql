-- Ensure users can upsert (insert/update) their own preferences
-- First drop the existing insert policy to avoid conflicts
DROP POLICY IF EXISTS "System can insert preferences" ON ai_user_preferences;

-- Create a comprehensive upsert policy that allows both INSERT and UPDATE
CREATE POLICY "Users can manage their own preferences"
ON ai_user_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comment explaining this policy
COMMENT ON POLICY "Users can manage their own preferences" ON ai_user_preferences IS 
'Allows users (via edge functions using service role or direct client) to insert and update their own preferences';