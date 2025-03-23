import { createClient } from "@/database/utils/supabase/server";
import { redirect } from "next/navigation";
import MeetingForm from "@/components/toolbox/meeting-form";

export default async function NewMeetingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Create New Toolbox Meeting</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to create a new toolbox meeting. The AI will generate a safety summary based on your inputs.
        </p>
      </div>
      
      <MeetingForm userId={user.id} />
    </div>
  );
} 