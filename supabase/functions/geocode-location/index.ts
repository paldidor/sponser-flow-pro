import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, state, zipCode } = await req.json();
    
    if (!city || !state) {
      return new Response(
        JSON.stringify({ error: 'City and state are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Google Geocoding API
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build address string - prioritize zip code for accuracy
    const address = zipCode 
      ? `${zipCode}, ${state}, USA`
      : `${city}, ${state}, USA`;

    console.log('🗺️ Geocoding address:', address);

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding failed:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ 
          error: 'Could not geocode address',
          details: data.error_message 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const location = data.results[0].geometry.location;
    console.log('✅ Geocoded to:', location);

    return new Response(
      JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: data.results[0].formatted_address,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geocode-location:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
