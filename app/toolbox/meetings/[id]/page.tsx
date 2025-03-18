import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, MapPin, Phone, User, Thermometer, Download, Printer } from "lucide-react";

export default async function MeetingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const params = await props.params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch meeting data
  const { data: meeting, error } = await supabase
    .from("toolbox_meetings")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !meeting) {
    console.error("Error fetching meeting:", error);
    return notFound();
  }

  // Get activated hazards
  const activeHazards = Object.entries(meeting.hazards)
    .filter(([_, value]) => value === true)
    .map(([key]) => key.replace(/_/g, ' '));

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div>
          <Link href="/toolbox/meetings" className="inline-flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Meetings
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{meeting.job_title}</h1>
          <p className="text-muted-foreground">
            <span className="inline-flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {new Date(meeting.date).toLocaleDateString()}
            </span>
            <span className="mx-2">•</span>
            <span>{meeting.company}</span>
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Job Description</h3>
              <p className="text-sm">{meeting.job_description}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Site Address</h3>
              <p className="text-sm flex items-start">
                <MapPin className="mr-1 h-4 w-4 mt-0.5 shrink-0" />
                {meeting.site_address}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Supervisor</h3>
              <p className="text-sm flex items-center">
                <User className="mr-1 h-4 w-4" />
                {meeting.supervisor_name}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Supervisor Phone</h3>
              <p className="text-sm flex items-center">
                <Phone className="mr-1 h-4 w-4" />
                {meeting.supervisor_phone}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Emergency Site Number</h3>
              <p className="text-sm">{meeting.emergency_site_number}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Site Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Weather</h3>
              <p className="text-sm flex items-center">
                {meeting.weather_conditions}
                <Thermometer className="mx-1 h-4 w-4" />
                {meeting.temperature}°C
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Road Conditions</h3>
              <p className="text-sm">{meeting.road_conditions || "Not specified"}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Lease Conditions</h3>
              <p className="text-sm">{meeting.lease_conditions || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hazards Assessment</CardTitle>
            <CardDescription>Identified hazards for this job</CardDescription>
          </CardHeader>
          <CardContent>
            {activeHazards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeHazards.map((hazard) => (
                  <Badge key={hazard} variant="outline" className="capitalize">
                    {hazard}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No specific hazards identified</p>
            )}
            
            {meeting.additional_comments && (
              <div className="mt-4">
                <h3 className="font-medium mb-1">Additional Comments</h3>
                <p className="text-sm">{meeting.additional_comments}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Safety Summary</CardTitle>
            <CardDescription>Generated safety briefing based on job details and hazards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{meeting.ai_safety_summary}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 