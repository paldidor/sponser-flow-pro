-- Add RLS policy to allow system/service role to insert recommendations
CREATE POLICY "System can insert recommendations"
ON ai_recommendations
FOR INSERT
WITH CHECK (true);

-- Add comment explaining this policy
COMMENT ON POLICY "System can insert recommendations" ON ai_recommendations IS 
'Allows edge functions using service role to insert AI-generated recommendations';