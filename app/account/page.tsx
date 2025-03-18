import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage, Message } from "@/components/form-message";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";

export default async function AccountPage(props: { 
  searchParams: Promise<{ message?: string; error?: string; success?: string }>
}) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if we have any message to display
  const hasMessage = Object.keys(searchParams).some(key => 
    ['message', 'error', 'success'].includes(key)
  );

  // Convert searchParams to the Message type expected by FormMessage
  const message: Message = searchParams.error 
    ? { error: searchParams.error }
    : searchParams.success
    ? { success: searchParams.success }
    : searchParams.message
    ? { message: searchParams.message }
    : {} as Message;

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and manage your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-sm text-muted-foreground mt-1">
                  Your email address is used for sign in and notifications
                </p>
              </div>
              <div>
                <Label htmlFor="created-at">Account Created</Label>
                <Input 
                  id="created-at" 
                  value={new Date(user.created_at).toLocaleDateString()} 
                  disabled 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" action="/protected/reset-password">
              <Button type="submit">Reset Password</Button>
              <p className="text-sm text-muted-foreground">
                You'll be sent a password reset email to confirm this change
              </p>
            </form>
          </CardContent>
        </Card>
        
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