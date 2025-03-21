import { z } from 'zod'
import { createPerplexity } from '@ai-sdk/perplexity'
import { generateText } from 'ai'

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
      model: perplexity('sonar-pro'),
      messages: [
        {
          role: 'system',
          content: `
            You are an expert at finding construction safety documents on the Alberta Occupational Health and Safety (OHS) website:
            https://ohs-pubstore.labour.alberta.ca/construction

            Your task:

            - Search only within the website above.
            - Based on the users query, find the most relevant safety documents.
            - Click into the documents (if needed) and extract the most relevant paragraph that addresses the query.
            - Return a response in strict JSON format only — no extra text, no markdown, no commentary.

            Each object in the JSON array should include:

            title: The name of the document
            summary: A short summary of what the document covers
            paragraph: A single relevant paragraph that answers the query
            url: The direct link to the document (include ?utm_source=openai at the end for tracking)
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
          format: 'json',
        },
      },
    })

    console.log(`text: ${text}`)
    console.log('sources:', JSON.stringify(sources, null, 2))
    console.log('providerMetadata:', JSON.stringify(providerMetadata, null, 2))

    return {
      result: text,
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