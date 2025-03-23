import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSectionProps {
  email: string;
  createdAt: string;
}

export function ProfileSection({ email, createdAt }: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>View and manage your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
            <p className="text-sm text-muted-foreground mt-1">
              Your email address is used for sign in and notifications
            </p>
          </div>
          <div>
            <Label htmlFor="created-at">Account Created</Label>
            <Input 
              id="created-at" 
              value={new Date(createdAt).toLocaleDateString()} 
              disabled 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 