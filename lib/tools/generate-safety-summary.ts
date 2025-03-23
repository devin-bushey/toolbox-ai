import { OpenAI } from 'openai';
import { SafetySearchResult } from './search-safety-standards';

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

// Create a client instance of OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default openai;

// Helper function to clean markdown and code blocks from response
function cleanMarkdownFormatting(text: string): string {
  // Remove markdown code blocks (```html, ```json, etc.)
  let cleaned = text.replace(/```(?:html|markdown|md|json|)\s*([\s\S]*?)\s*```/g, '$1');
  
  // Remove any remaining triple backticks
  cleaned = cleaned.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
  
  return cleaned.trim();
}

// Function to generate a safety summary based on form data and safety standards
export async function generateSafetySummary(
  formData: any, 
  safetyStandards: SafetySearchResult
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a senior safety expert with hands-on experience in civil construction projects in Alberta, Canada. 

            Your task is to generate a clear and concise safety briefing based on the provided job context. The briefing will be used in a toolbox meeting.

            Focus on:
            - Outlining the key hazards and risks associated with the job.
            - Providing practical safety measures and protocols to mitigate those risks.
            - Ensuring the briefing is relevant to all site personnel, including construction workers, foremen, supervisors, and safety officers.

            Formatting requirements:
            - The response will be displayed in a tiptap/react ProseMirror text editor with HTML support.
            - Use basic HTML tags (e.g. <h2>, <ul>, <li>, <p>) to organize content for readability.
            - Maintain clear structure and spacing.
            - Include only the following sections:
              - <h2>Safety Measures</h2>
              - <h2>Final Remarks</h2>

          `
        },
        {
          role: "user",
          content: `Generate a safety briefing for a toolbox meeting using the following details as context:
          
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

            Please follow the system instructions and adhere to the formatting and structure guidelines.
            `
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "Could not generate safety summary.";
    
    // Clean any markdown formatting from the response
    return cleanMarkdownFormatting(content);
  } catch (error) {
    console.error("Error generating safety summary:", error);
    return "Error generating safety summary. Please try again later.";
  }
} 