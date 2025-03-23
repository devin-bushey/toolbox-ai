import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswordSection() {
  return (
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
  );
} 