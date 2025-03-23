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
          content: "You are a safety expert in the construction industry. Create a concise, well-formatted safety briefing based on the provided job details, hazards, and safety standards.\n\nYour response should use basic HTML formatting to ensure good readability. The content will be displayed directly in a rich text editor, so proper formatting is essential.\n\nFORMAT YOUR RESPONSE LIKE THIS:\n<h2>Safety Briefing: [Job Title]</h2>\n<h3>Job Overview</h3>\n<p>[Brief description of the job]</p>\n\n<h3>Hazards and Controls</h3>\n<ul>\n  <li><strong>[Hazard 1]</strong>: [Safety measure]</li>\n  <li><strong>[Hazard 2]</strong>: [Safety measure]</li>\n</ul>\n\n<h3>Safety Standards</h3>\n<p>[Mention of relevant regulations]</p>\n\n<h3>Key Reminders</h3>\n<ul>\n  <li>[Important reminder 1]</li>\n  <li>[Important reminder 2]</li>\n</ul>\n\nDO NOT include any markdown formatting, code block indicators or language specifiers in your response."
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
${safetyStandards.result}`
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