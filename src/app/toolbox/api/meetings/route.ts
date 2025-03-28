import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/database/utils/supabase/server";
import { generateSafetySummary } from "@/app/toolbox/_tools/generate-safety-summary";
import { searchSafetyStandards, SafetySearchResult } from "@/app/toolbox/_tools/search-safety-standards";

// Increase timeout to 60 seconds
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const formData = await request.json();

    // Validate that the user_id matches the authenticated user
    if (formData.user_id !== user.id) {
      return NextResponse.json(
        { error: "User ID mismatch" },
        { status: 403 }
      );
    }

    // First, get relevant safety standards based on the job details
    const safetyQuery = `${formData.job_title} ${formData.job_description} ${
      Object.entries(formData.hazards)
        .filter(([_, value]) => value === true)
        .map(([key]) => key.replace(/_/g, ' '))
        .join(', ')
    }`;

    // Create a fallback safety result
    const fallbackSafetyResult: SafetySearchResult = {
      result: "Unable to fetch safety standards. Please review safety requirements manually.",
      sources: [],
      metadata: { timestamp: new Date().toISOString() }
    };

    // Fetch safety standards using Perplexity - run this with a timeout
    const safetyStandardsPromise = searchSafetyStandards(safetyQuery)
      .catch(error => {
        console.error("Error fetching safety standards:", error);
        return fallbackSafetyResult;
      });
      
    // Set a timeout for the safety standards call
    const timeoutPromise = new Promise<SafetySearchResult>(resolve => {
      setTimeout(() => {
        resolve({
          result: "Safety standards search timed out. Please review safety requirements manually.",
          sources: [],
          metadata: { timestamp: new Date().toISOString() }
        });
      }, 20000); // 20 second timeout
    });
    
    // Use Promise.race to handle potential timeouts
    const safetyStandards = await Promise.race([safetyStandardsPromise, timeoutPromise]);
    
    // Generate AI safety summary using OpenAI with the fetched safety standards
    const aiSafetySummary = await generateSafetySummary(formData, safetyStandards)
      .catch(error => {
        console.error("Error generating safety summary:", error);
        return "Error generating safety summary. Please create a safety plan manually.";
      });

    // Combine form data with safety summary and standards
    const meetingData = {
      ...formData,
      ai_safety_summary: aiSafetySummary,
      safety_standards: safetyStandards.result,
      safety_standards_sources: safetyStandards.sources,
      safety_standards_metadata: safetyStandards.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert data into Supabase
    const { data, error } = await supabase
      .from("toolbox_meetings")
      .insert(meetingData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting meeting data:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    // Query meetings for the authenticated user
    const { data, error, count } = await supabase
      .from("toolbox_meetings")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching meetings:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      meetings: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 