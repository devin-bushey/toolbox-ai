import { z } from 'zod'
import { createPerplexity } from '@ai-sdk/perplexity'
import { generateText } from 'ai'
import { cleanMarkdownFormatting } from '../_utils/clean-markdown'

const searchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  context: z.string().optional(),
})

const perplexity = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY,
})

export type SafetySearchResult = {
  result: string
  sources: Array<{ sourceType: string; id: string; url: string }>
  metadata: {
    images?: null
    usage?: {
      citationTokens: number
      numSearchQueries: number
    }
    timestamp: string
  }
}

export async function searchSafetyStandards(
  query: string,
  context?: string
): Promise<SafetySearchResult> {
  try {
    // Validate input
    const validatedData = searchRequestSchema.parse({ query, context })

    // Construct the search query
    const searchQuery = `Search for Alberta Safety Standards related to: ${validatedData.query}${
      validatedData.context ? `. Additional context: ${validatedData.context}` : ''
    }`

    // Use Vercel AI SDK with Perplexity
    const { text, sources, providerMetadata } = await generateText({
      model: perplexity('sonar'),
      messages: [
        {
          role: 'system',
          content: `
            You are an expert at finding construction safety documents related to the Alberta, Canada - Occupational Health and Safety (OHS) regulations.

            Your task:

            - Based on the users query, find the most relevant safety documents in Alberta, Canada.
            - Do not include any documents that are not related to Alberta, Canada.
            - Please search in this domain: https://ohs-pubstore.labour.alberta.ca/construction
            - Click into the documents (if needed) and extract the most relevant paragraph that addresses the query.
            - Return a response in strict JSON format only — no extra text, no markdown, no commentary.
            - Ensure all JSON strings are properly escaped, with no unescaped quotes or invalid characters.
            - Double-check your JSON response is valid before returning it.

            Each object in the JSON array should include:

            title: The name of the document
            summary: A short summary of what the document covers
            paragraph: A single relevant paragraph that answers the query
          `
        },
        {
          role: 'user',
          content: searchQuery,
        },
      ],
      providerOptions: {
        perplexity: {
          return_images: false,
          search_domain_filter: ['https://ohs-pubstore.labour.alberta.ca/construction'],
          web_search_options: {
            search_context_size: 'medium',
          }
        },
      },
    })

    const result = cleanMarkdownFormatting(text)

    return {
      result,
      sources,
      metadata: {
        ...providerMetadata?.perplexity,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid search parameters: ${error.message}`)
    }
    throw new Error(`Safety search error: ${error}`)
  }
} 