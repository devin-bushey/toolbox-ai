import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  ClipboardListIcon, 
  FilePlus2Icon, 
  LayoutDashboardIcon 
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch recent toolbox meetings
  const { data: meetings, error } = await supabase
    .from("toolbox_meetings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching meetings:", error);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Toolbox AI Dashboard</h1>
        <Link href="/toolbox/meetings/new">
          <Button className="mt-4 md:mt-0">
            <FilePlus2Icon className="mr-2 h-4 w-4" />
            New Toolbox Meeting
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          title="Create Meeting" 
          description="Generate a new toolbox meeting plan" 
          href="/toolbox/meetings/new"
          icon={<FilePlus2Icon className="h-6 w-6" />}
        />
        <DashboardCard 
          title="Meeting History" 
          description="View past toolbox meeting plans" 
          href="/toolbox/meetings"
          icon={<CalendarIcon className="h-6 w-6" />}
        />
        <DashboardCard 
          title="Hazard Library" 
          description="Browse common safety hazards" 
          href="/toolbox/hazards"
          icon={<ClipboardListIcon className="h-6 w-6" />}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
        {meetings && meetings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Job Title</th>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Site Address</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="border-b border-muted hover:bg-muted/50">
                    <td className="px-4 py-2">{new Date(meeting.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{meeting.job_title}</td>
                    <td className="px-4 py-2">{meeting.company}</td>
                    <td className="px-4 py-2">{meeting.site_address}</td>
                    <td className="px-4 py-2">
                      <Link href={`/toolbox/meetings/${meeting.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center border rounded-md bg-muted/20">
            <p className="text-muted-foreground">No recent meetings found. Create your first toolbox meeting!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: React.ReactNode; 
}) {
  return (
    <Link href={href} className="block">
      <div className="border rounded-lg p-6 h-full hover:border-primary hover:shadow-sm transition-all">
        <div className="flex items-center mb-4 text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
} 