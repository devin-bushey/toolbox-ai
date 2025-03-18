# Toolbox AI - Construction Safety Planning Solution

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-latest-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

Toolbox AI is a Next.js application that helps construction teams create toolbox meeting plans and safety assessments using AI. The application integrates with Supabase for authentication and data storage, and uses OpenAI's GPT-4 model to generate detailed safety briefings based on job details and identified hazards.

## 📋 Features

- **User Authentication**: Secure login and registration using Supabase Auth
- **Toolbox Meeting Creation**: Easy-to-use form for creating detailed job safety assessments
- **AI-Powered Safety Briefings**: Automatic generation of professional safety briefings based on job details
- **Meeting History**: View and manage all past toolbox meetings
- **Responsive Design**: Works on desktop and mobile devices
- **Construction-Specific Hazard Management**: Built-in support for common construction hazards

## 🔧 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **Database**: PostgreSQL (via Supabase)
- **AI**: OpenAI GPT-4
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI, shadcn/ui

## 📁 Project Structure

```
toolbox-ai/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages  
│   ├── dashboard/        # Dashboard pages
│   └── meetings/         # Meeting management pages
├── components/           # Reusable UI components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client and helpers
│   └── openai/           # OpenAI integration
├── types/                # TypeScript type definitions
│   └── supabase.ts       # Database schema types
└── utils/                # Helper functions
```

## 🗄️ Database Schema

The application uses two primary tables in Supabase:

### `toolbox_meetings` Table
- `id`: UUID (primary key)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `user_id`: Foreign key to user table
- `job_title`: String
- `job_description`: String
- `company`: String
- `site_address`: String
- `supervisor_name`: String
- `supervisor_phone`: String
- `emergency_site_number`: String
- `weather_conditions`: String
- `temperature`: Number
- `road_conditions`: String
- `lease_conditions`: String
- `date`: String (ISO format)
- `time`: String
- `hazards`: JSON object (containing boolean flags for various hazards)
- `additional_comments`: String
- `ai_safety_summary`: String (AI-generated content)

### `profiles` Table
- `id`: UUID (primary key)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `email`: String
- `name`: String
- `company`: String
- `role`: String

## 🚀 Getting Started

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

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
```

4. Update your Supabase database schema:
- Create a `toolbox_meetings` table with the schema defined in `types/supabase.ts`
- Create a `profiles` table for user profile information
- Set up appropriate RLS (Row Level Security) policies for data access

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

The application can be deployed to Vercel or other platforms that support Next.js applications.

1. Build the application:
```bash
npm run build
```

2. Deploy to Vercel:
```bash
npx vercel
```

## 🧪 Testing

Run the test suite with:

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
