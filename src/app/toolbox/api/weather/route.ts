import { NextRequest, NextResponse } from 'next/server';

// Function to geocode an address using Google Maps API
async function geocodeAddress(address: string): Promise<{ lat: number, lon: number } | null> {
  try {
    // Get Google Maps API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    // Call Google Maps Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
    
    const location = data.results[0].geometry.location;
    
    return {
      lat: location.lat,
      lon: location.lng
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    );
  }

  try {
    // Geocode the address to get coordinates
    const coordinates = await geocodeAddress(address);
    
    if (!coordinates) {
      throw new Error('Could not geocode address');
    }
    
    // Get API key from environment variables
    const apiKey = process.env.WEATHER_TOMORROW_API_KEY;
    
    if (!apiKey) {
      throw new Error('Weather API key not configured');
    }
    
    // Call Tomorrow.io Realtime Weather API
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${coordinates.lat},${coordinates.lon}&units=metric&apikey=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tomorrow.io API error:', errorText);
      throw new Error(`Weather API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Map Tomorrow.io data to our response format
    const weatherData = {
      weather_conditions: mapWeatherCondition(data.data.values.weatherCode),
      temperature: data.data.values.temperature,
      road_conditions: deriveRoadConditions(data.data.values.weatherCode, data.data.values.precipitationProbability)
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

// Map Tomorrow.io weather codes to more descriptive conditions
// Based on Tomorrow.io weather codes: https://docs.tomorrow.io/reference/data-layers-core#weather-codes
function mapWeatherCondition(weatherCode: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Unknown',
    1000: 'Clear',
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    1001: 'Cloudy',
    2000: 'Fog',
    2100: 'Light Fog',
    4000: 'Drizzle',
    4001: 'Rain',
    4200: 'Light Rain',
    4201: 'Heavy Rain',
    5000: 'Snow',
    5001: 'Flurries',
    5100: 'Light Snow',
    5101: 'Heavy Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7101: 'Heavy Ice Pellets',
    7102: 'Light Ice Pellets',
    8000: 'Thunderstorm'
  };
  
  return weatherCodes[weatherCode] || 'Unknown';
}

// Derive road conditions based on weather code and precipitation probability
function deriveRoadConditions(weatherCode: number, precipProbability: number): string {
  // Snow or freezing precipitation
  if ([5000, 5001, 5100, 5101, 6000, 6001, 6200, 6201, 7000, 7101, 7102].includes(weatherCode)) {
    return 'Icy or Snow Covered';
  }
  
  // Rain
  if ([4000, 4001, 4200, 4201, 8000].includes(weatherCode)) {
    return precipProbability > 50 ? 'Wet and Slippery' : 'Potentially Wet';
  }
  
  // Fog
  if ([2000, 2100].includes(weatherCode)) {
    return 'Reduced Visibility';
  }
  
  // Default for clear or cloudy conditions
  return 'Dry';
} 