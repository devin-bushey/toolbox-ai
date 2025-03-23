import { createClient } from "@/database/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormMessage, Message } from "@/components/ui/form-message";
import { ProfileSection } from "./_components/profile-section";
import { PasswordSection } from "./_components/password-section";

interface SearchParams {
  message?: string;
  error?: string;
  success?: string;
}

interface AccountPageProps {
  searchParams: Promise<SearchParams>;
}

function createMessageFromSearchParams(params: SearchParams): Message {
  if (params.error) return { error: params.error };
  if (params.success) return { success: params.success };
  if (params.message) return { message: params.message };
  return {} as Message;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const message = createMessageFromSearchParams(params);
  const hasMessage = Object.keys(params).some(key => 
    ['message', 'error', 'success'].includes(key)
  );

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid gap-8">
        <ProfileSection email={user.email ?? ''} createdAt={user.created_at} />
        <PasswordSection />
        
        {hasMessage && <FormMessage message={message} />}
        
        <div className="flex justify-between">
          <Link href="/toolbox/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 