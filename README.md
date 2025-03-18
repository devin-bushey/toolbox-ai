# Toolbox AI - Construction Safety Planning Solution

Toolbox AI is a Next.js application that helps construction teams create toolbox meeting plans and safety assessments using AI. The application integrates with Supabase for authentication and data storage, and uses OpenAI's GPT-4 model to generate detailed safety briefings based on job details and identified hazards.

## Features

- **User Authentication**: Secure login and registration using Supabase Auth
- **Toolbox Meeting Creation**: Easy-to-use form for creating detailed job safety assessments
- **AI-Powered Safety Briefings**: Automatic generation of professional safety briefings based on job details
- **Meeting History**: View and manage all past toolbox meetings
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **Database**: PostgreSQL (via Supabase)
- **AI**: OpenAI GPT-4
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI, shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/toolbox-ai.git
cd toolbox-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy the `.env.example` file to `.env.local`
- Update the Supabase and OpenAI API credentials

```bash
cp .env.example .env.local
```

4. Update your Supabase database schema:
- Create a `toolbox_meetings` table with the schema defined in `types/supabase.ts`
- Create a `profiles` table for user profile information

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application can be deployed to Vercel or other platforms that support Next.js applications.

```bash
npm run build
```

## License

[MIT](LICENSE)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
