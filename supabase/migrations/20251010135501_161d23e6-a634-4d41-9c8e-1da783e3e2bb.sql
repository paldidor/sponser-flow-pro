-- Add zip_code column to business_profiles
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add indexes for recommendations queries
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_message_id ON ai_recommendations(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_conversation_id_user_action ON ai_recommendations(conversation_id, user_action);

-- Update config.toml for geocode-location function
-- This will be handled separately in config.toml file