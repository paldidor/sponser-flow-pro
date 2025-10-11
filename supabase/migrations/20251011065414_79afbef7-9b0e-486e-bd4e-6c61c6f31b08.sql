-- Add recommendation_data column to store full recommendation objects
ALTER TABLE ai_recommendations 
ADD COLUMN IF NOT EXISTS recommendation_data JSONB;

-- Add comment explaining the column
COMMENT ON COLUMN ai_recommendations.recommendation_data IS 'Stores full recommendation object with team_name, price, reach, logo, images, distance_km, etc. to avoid additional queries when displaying cards';