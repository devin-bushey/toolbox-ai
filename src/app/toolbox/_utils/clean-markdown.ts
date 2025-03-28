export function cleanMarkdownFormatting(text: string): string {
  // Remove markdown code blocks (```html, ```json, etc.)
  let cleaned = text.replace(/```(?:html|markdown|md|json|)\s*([\s\S]*?)\s*```/g, '$1');
  
  // Remove any remaining triple backticks
  cleaned = cleaned.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
  
  return cleaned.trim();
}