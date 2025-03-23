import { createClient } from "@/database/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardHatIcon, ShieldCheckIcon, ClipboardCheckIcon } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    return redirect("/toolbox/dashboard");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Toolbox AI
            </h1>
            <p className="text-lg md:text-xl max-w-[700px] mx-auto">
              Generate professional safety briefings and toolbox meeting plans for construction teams using AI.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <HardHatIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Safety First</h3>
            <p className="text-muted-foreground">
              Create comprehensive hazard assessments tailored to your specific job site conditions.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground">
              Generate professional safety briefings using advanced AI technology that considers all potential hazards.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <ClipboardCheckIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Compliance Made Easy</h3>
            <p className="text-muted-foreground">
              Maintain detailed records of all safety meetings and hazard assessments for regulatory compliance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
