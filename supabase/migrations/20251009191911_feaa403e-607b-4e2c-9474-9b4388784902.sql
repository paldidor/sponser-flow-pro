-- Create AI Conversations Table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'in-app',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_conversations_status ON ai_conversations(status);
CREATE INDEX idx_conversations_last_activity ON ai_conversations(last_activity_at DESC);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create AI Messages Table
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_messages_created_at ON ai_messages(created_at DESC);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert messages"
  ON ai_messages FOR INSERT
  WITH CHECK (true);

-- Create AI Recommendations Table
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
  sponsorship_offer_id UUID REFERENCES sponsorship_offers(id) ON DELETE SET NULL,
  package_id UUID REFERENCES sponsorship_packages(id) ON DELETE SET NULL,
  recommendation_reason TEXT,
  user_action TEXT CHECK (user_action IN ('viewed', 'saved', 'contacted', 'ignored', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_conversation ON ai_recommendations(conversation_id);
CREATE INDEX idx_recommendations_offer ON ai_recommendations(sponsorship_offer_id);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations in their conversations"
  ON ai_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_recommendations.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own recommendations"
  ON ai_recommendations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_recommendations.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Create AI User Preferences Table
CREATE TABLE ai_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  preferred_sports TEXT[],
  budget_range NUMRANGE,
  preferred_locations TEXT[],
  avoided_offers UUID[],
  interaction_patterns JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON ai_user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON ai_user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert preferences"
  ON ai_user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_conversations_timestamp
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_timestamp();

CREATE TRIGGER update_ai_preferences_timestamp
  BEFORE UPDATE ON ai_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_timestamp();