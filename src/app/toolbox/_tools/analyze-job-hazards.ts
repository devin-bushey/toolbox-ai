import { OpenAI } from 'openai';

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

// Create a client instance of OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface HazardAnalysisResult {
  hazards: Record<string, boolean>;
  additional_comments: string;
}

export async function analyzeJobHazards(
  jobDescription: string,
  weatherConditions: string | null,
  temperature: number | null,
  roadConditions?: string | null
): Promise<HazardAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a construction safety expert. Analyze the job description and conditions to identify
            potential hazards. Respond with JSON containing two fields:
            1. "hazards": an object with boolean values for each hazard category
            2. "additional_comments": text with safety-specific comments and precautions

            Hazard categories to consider:
            - confined_space: Work in tanks, pits, or enclosed areas
            - driving: Operating vehicles or transportation
            - electrical_work: Work involving electricity or power systems
            - hand_power_tools: Using manual or powered tools
            - heat_cold: Exposure to extreme temperatures
            - heavy_lifting: Manual handling of heavy materials
            - mobile_equipment: Working with or near heavy machinery
            - open_excavation: Trenches, holes, or excavation work
            - other_trades: Working alongside other contractors
            - ppe: Special personal protective equipment needed
            - pinch_points: Areas where body parts could be caught
            - slips_trips_falls: Uneven surfaces or fall hazards
            - working_at_heights: Elevated work areas requiring fall protection
          `
        },
        {
          role: "user",
          content: `
            Analyze this construction job for safety hazards:
            
            Job Description: ${jobDescription}
            Weather: ${weatherConditions || 'Unknown'}, ${temperature || 'Unknown'}°C
            Road Conditions: ${roadConditions || 'Unknown'}
            
            Respond with JSON containing appropriate hazards as true/false values and additional safety comments.
          `
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Failed to generate hazard analysis");
    }

    // Parse the JSON response
    return JSON.parse(content) as HazardAnalysisResult;
  } catch (error) {
    console.error("Error analyzing hazards:", error);
    // Return default values if analysis fails
    return {
      hazards: {
        confined_space: false,
        driving: false,
        electrical_work: false,
        hand_power_tools: false,
        heat_cold: false,
        heavy_lifting: false,
        mobile_equipment: false,
        open_excavation: false,
        other_trades: false,
        ppe: false,
        pinch_points: false,
        slips_trips_falls: false,
        working_at_heights: false,
      },
      additional_comments: "Unable to automatically analyze hazards. Please review job details and identify hazards manually."
    };
  }
} 