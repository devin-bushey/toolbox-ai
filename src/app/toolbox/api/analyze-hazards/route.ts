import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobHazards } from '../../_tools/analyze-job-hazards';

export async function POST(request: NextRequest) {
  try {
    const { job_description, weather_conditions, temperature, road_conditions } = await request.json();

    if (!job_description) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const hazardAnalysis = await analyzeJobHazards(
      job_description,
      weather_conditions,
      temperature,
      road_conditions
    );
    
    return NextResponse.json(hazardAnalysis);
  } catch (error) {
    console.error("Error analyzing hazards:", error);
    return NextResponse.json(
      { error: 'Failed to analyze hazards' },
      { status: 500 }
    );
  }
} 