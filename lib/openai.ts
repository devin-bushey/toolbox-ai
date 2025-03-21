import { OpenAI } from 'openai';
import { searchSafetyStandards } from './tools/safety-search';

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

// Create a client instance of OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default openai;

// Function to generate a safety summary based on form data
export async function generateSafetySummary(formData: any): Promise<string> {
  try {
    // First, get relevant safety standards based on the job details
    const safetyQuery = `${formData.job_title} ${formData.job_description} ${
      Object.entries(formData.hazards)
        .filter(([_, value]) => value === true)
        .map(([key]) => key.replace(/_/g, ' '))
        .join(', ')
    }`;

    const safetyStandards = await searchSafetyStandards(safetyQuery);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a safety expert in the construction industry. Generate a concise safety briefing based on the provided job details, identified hazards, and relevant safety standards.
          
          The safety standards information is provided in JSON format and should be incorporated into your briefing where relevant.`
        },
        {
          role: "user",
          content: `Generate a safety briefing for a toolbox meeting with the following details:
          
            Job Title: ${formData.job_title}
            Job Description: ${formData.job_description}
            Weather: ${formData.weather_conditions}, ${formData.temperature}°C
            Road Conditions: ${formData.road_conditions}
            Site Address: ${formData.site_address}

            Identified Hazards: ${Object.entries(formData.hazards)
              .filter(([_, value]) => value === true)
              .map(([key]) => key.replace(/_/g, ' '))
              .join(', ')}

            Additional Comments: ${formData.additional_comments || 'None'}

            Relevant Safety Standards:
            ${safetyStandards.result}

            The briefing should:
            1. Be concise and practical
            2. Include specific safety measures for the identified hazards
            3. Reference relevant safety standards and regulations where applicable
            4. Provide clear, actionable guidance for workers`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Could not generate safety summary.";
  } catch (error) {
    console.error("Error generating safety summary:", error);
    return "Error generating safety summary. Please try again later.";
  }
} 