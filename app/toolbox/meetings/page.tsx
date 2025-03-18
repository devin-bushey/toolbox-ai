import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilePlus2Icon, FileTextIcon } from "lucide-react";

export default async function MeetingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch toolbox meetings
  const { data: meetings, error } = await supabase
    .from("toolbox_meetings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meetings:", error);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Toolbox Meetings</h1>
        <Link href="/toolbox/meetings/new">
          <Button className="mt-4 md:mt-0">
            <FilePlus2Icon className="mr-2 h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      </div>
      
      {meetings && meetings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Job Title</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Site Address</th>
                <th className="px-4 py-3 text-left">Supervisor</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-muted hover:bg-muted/50">
                  <td className="px-4 py-3">{new Date(meeting.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium">{meeting.job_title}</td>
                  <td className="px-4 py-3">{meeting.company}</td>
                  <td className="px-4 py-3">{meeting.site_address}</td>
                  <td className="px-4 py-3">{meeting.supervisor_name}</td>
                  <td className="px-4 py-3">
                    <Link href={`/toolbox/meetings/${meeting.id}`}>
                      <Button variant="outline" size="sm" className="mr-2">
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border rounded-md text-center bg-muted/20">
          <p className="text-muted-foreground mb-6">No meetings found. Create your first toolbox meeting!</p>
          <Link href="/toolbox/meetings/new">
            <Button>
              <FilePlus2Icon className="mr-2 h-4 w-4" />
              Create Meeting
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 