# Toolbox AI - Construction Safety Planning Solution

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![Supabase](https://img.shields.io/badge/Supabase-latest-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

Toolbox AI is a Next.js application that helps construction teams create toolbox meeting plans and safety assessments using AI. The application integrates with Supabase for authentication and data storage, and uses AI to generate detailed safety briefings based on job details and identified hazards.

## 📋 Features

- **User Authentication**: Secure login and registration using Supabase Auth
- **Toolbox Meeting Creation**: Easy-to-use form for creating detailed job safety assessments
- **AI-Powered Safety Briefings**: Automatic generation of professional safety briefings based on job details
- **Meeting History**: View and manage all past toolbox meetings
- **Responsive Design**: Works on desktop and mobile devices
- **Construction-Specific Hazard Management**: Built-in support for common construction hazards

## 🔧 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3
- **Backend**: Supabase 
- **Database**: PostgreSQL (via Supabase)
- **UI Components**: shadcn/ui, Radix UI primitives
- **Editor**: TipTap rich text editor
- **AI**: OpenAI, Perplexity AI
- **Forms**: React Hook Form with Zod validation

## 📁 Example Project Structure

```
toolbox-ai/
├── src/                   # Main source code directory
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable UI components
│   └── utils/             # Utility functions
├── database/              # Database configuration
│   ├── utils/supabase/    # Supabase client and helpers
│   └── types/             # Database schema types
├── middleware.ts          # Auth middleware for protected routes
└── .env.local             # Environment variables
```



## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for local Supabase)
- Supabase CLI
- OpenAI API key

### Setting up Supabase Locally

1. Install/upgrade Supabase CLI:
```bash
brew upgrade supabase
```

2. Start Supabase locally:
```bash
supabase start
```

After running `supabase start`, you'll see output containing your local credentials.

3. Create a `.env.local` file with these credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
OPENAI_API_KEY=your-openai-api-key
```

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

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

The application can be deployed to Vercel or other platforms that support Next.js applications.

```bash
npm run build
npx vercel
```

## 🧪 Testing

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TipTap](https://tiptap.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)
