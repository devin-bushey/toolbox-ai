import { redirect } from "next/navigation";
import { createClient } from "@/database/utils/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Redirect to our toolbox dashboard if user is authenticated
  return redirect("/toolbox/dashboard");
}
