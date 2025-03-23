# Toolbox AI - Construction Safety Planning Tool

This directory contains the core functionality of the Toolbox AI application, which helps construction professionals create comprehensive safety briefings and toolbox meeting plans.

## Structure

- `_components/` - Reusable UI components specific to the toolbox feature
- `_tools/` - AI-powered utility functions for analyzing hazards and generating safety content
- `_utils/` - Helper functions specific to the toolbox feature
- `api/` - API routes for backend functionality
- `dashboard/` - Dashboard pages for viewing and managing safety plans
- `meetings/` - Pages for viewing and managing toolbox meetings

## How It Works

The toolbox feature uses AI to help construction professionals create comprehensive safety plans:

1. **Job Details Collection**: Users input their job details including location, supervisor information, and job description.

2. **Weather Integration**: The system automatically fetches weather conditions for the job site location.

3. **Hazard Analysis**: AI analyzes the job description and conditions to identify potential hazards.

4. **Safety Standards Integration**: The system searches relevant safety standards based on the job details.

5. **AI Safety Summary Generation**: Using OpenAI, the system generates a professional safety briefing that includes:
   - Job-specific safety considerations
   - Weather-related precautions
   - Required PPE
   - Relevant safety regulations
   - Emergency procedures

6. **Editable Content**: Users can review and edit the AI-generated content before finalizing.

7. **Meeting Management**: Users can view their meeting history, edit past meetings, and create new ones.

## API Endpoints

- `/toolbox/api/meetings` - Create, read, update, and delete toolbox meetings
- `/toolbox/api/analyze-hazards` - AI analysis of job hazards based on job description and conditions
- `/toolbox/api/weather` - Integration with weather services to get current conditions at job sites

## AI Tools

- `generate-safety-summary.ts` - Creates professional safety briefings using OpenAI
- `analyze-job-hazards.ts` - Uses AI to identify potential hazards based on job details
- `search-safety-standards.ts` - Finds relevant safety standards for specific job types

## Getting Started

To work with the toolbox feature, ensure you have:

1. Set up your API keys in `.env.local`
2. Configured your Supabase instance with the appropriate tables

For more details on the full application setup, refer to the main project README. 