"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@//tools/utils";
import { format } from "date-fns";

const formSchema = z.object({
  job_title: z.string().min(2, "Job title is required"),
  job_description: z.string().min(5, "Job description is required"),
  company: z.string().min(2, "Company name is required"),
  site_address: z.string().min(5, "Site address is required"),
  supervisor_name: z.string().min(2, "Supervisor name is required"),
  supervisor_phone: z.string().min(10, "Valid phone number is required"),
  emergency_site_number: z.string().min(3, "Emergency site number is required"),
  weather_conditions: z.string().min(2, "Weather conditions are required"),
  temperature: z.coerce.number(),
  road_conditions: z.string().optional(),
  lease_conditions: z.string().optional(),
  date: z.date(),
  time: z.string(),
  hazards: z.object({
    confined_space: z.boolean().default(false),
    driving: z.boolean().default(false),
    electrical_work: z.boolean().default(false),
    hand_power_tools: z.boolean().default(false),
    heat_cold: z.boolean().default(false),
    heavy_lifting: z.boolean().default(false),
    mobile_equipment: z.boolean().default(false),
    open_excavation: z.boolean().default(false),
    other_trades: z.boolean().default(false),
    ppe: z.boolean().default(false),
    pinch_points: z.boolean().default(false),
    slips_trips_falls: z.boolean().default(false),
    working_at_heights: z.boolean().default(false),
  }),
  additional_comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MeetingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("job-details");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_title: "Pipeline Installation Project",
      job_description: "Installation of 24-inch diameter pipeline including excavation, welding, and backfilling operations. Project involves heavy equipment operation and confined space entry.",
      company: "ABC Pipeline Construction Ltd.",
      site_address: "456 Industrial Park Road, Calgary, AB T2P 1N4",
      supervisor_name: "Michael Anderson",
      supervisor_phone: "403-555-0123",
      emergency_site_number: "403-555-9911",
      weather_conditions: "Partly Cloudy",
      temperature: 22,
      road_conditions: "Dry, well-maintained",
      lease_conditions: "Good - recently graded",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      hazards: {
        confined_space: true,
        driving: true,
        electrical_work: false,
        hand_power_tools: true,
        heat_cold: true,
        heavy_lifting: true,
        mobile_equipment: true,
        open_excavation: true,
        other_trades: true,
        ppe: true,
        pinch_points: true,
        slips_trips_falls: true,
        working_at_heights: false,
      },
      additional_comments: "Site requires continuous monitoring of H2S levels. All workers must carry personal monitors. Adjacent pipeline operations ongoing - coordination required.",
    },
    mode: "onSubmit",
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      // Add user_id to the data
      const formData = {
        ...data,
        user_id: userId,
      };

      const response = await fetch("/api/toolbox/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create toolbox meeting");
      }

      const result = await response.json();
      router.push(`/toolbox/meetings/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error state here
    } finally {
      setIsSubmitting(false);
    }
  }

  // This function handles validation errors and tab navigation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await form.trigger();
    
    if (!result) {
      // Get all fields with errors
      const errors = form.formState.errors;
      
      // Determine which tab has the first error
      let tabWithError = "job-details";
      
      // Job details fields
      const jobDetailsFields = ["job_title", "job_description", "company", "site_address", "supervisor_name", "supervisor_phone", "emergency_site_number"];
      // Conditions fields
      const conditionsFields = ["date", "time", "weather_conditions", "temperature"];
      // Check job details fields
      for (const field of jobDetailsFields) {
        if (errors[field as keyof typeof errors]) {
          tabWithError = "job-details";
          break;
        }
      }
      
      // If no errors in job details, check conditions
      if (tabWithError === "job-details" && !jobDetailsFields.some(field => errors[field as keyof typeof errors])) {
        for (const field of conditionsFields) {
          if (errors[field as keyof typeof errors]) {
            tabWithError = "conditions";
            break;
          }
        }
      }
      
      // If no errors in job details or conditions, must be in hazards (or we would have validated)
      if (tabWithError === "job-details" && !jobDetailsFields.some(field => errors[field as keyof typeof errors]) && 
          !conditionsFields.some(field => errors[field as keyof typeof errors])) {
        tabWithError = "hazards";
      }
      
      // Switch to the tab with errors
      setActiveTab(tabWithError);
      
      // Focus on the first error field after a short delay to allow tab switch to complete
      setTimeout(() => {
        const firstErrorField = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
      }, 100);
      
      return;
    }
    
    // If validation passes, submit the form
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="job-details">Job Details</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="hazards">Hazards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="job-details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Foundation Dig" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="ACME Construction" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="job_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe the job and tasks to be performed"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="site_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Construction Ave" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="supervisor_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supervisor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supervisor_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supervisor Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="555-123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="emergency_site_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Site Number</FormLabel>
                        <FormControl>
                          <Input placeholder="911" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("conditions")}
                >
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="conditions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Meeting Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weather_conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weather Conditions</FormLabel>
                          <FormControl>
                            <Input placeholder="Clear, Rainy, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="road_conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road Conditions</FormLabel>
                          <FormControl>
                            <Input placeholder="Dry, Wet, Icy, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lease_conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lease Conditions</FormLabel>
                          <FormControl>
                            <Input placeholder="Good, Poor, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveTab("job-details")}
                >
                  Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("hazards")}
                >
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="hazards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hazards Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="hazards.confined_space"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Confined Space</FormLabel>
                            <FormDescription>
                              Work in tanks, pits, or enclosed areas.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.driving"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Driving</FormLabel>
                            <FormDescription>
                              Operating vehicles or transportation.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.electrical_work"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Electrical Work</FormLabel>
                            <FormDescription>
                              Work involving electricity or power systems.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.hand_power_tools"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Hand and Power Tools</FormLabel>
                            <FormDescription>
                              Using manual or powered tools.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.heat_cold"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Heat and Cold</FormLabel>
                            <FormDescription>
                              Exposure to extreme temperatures.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.heavy_lifting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Heavy Lifting</FormLabel>
                            <FormDescription>
                              Manual handling of heavy materials.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.mobile_equipment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Mobile Equipment</FormLabel>
                            <FormDescription>
                              Working with or near heavy machinery.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.open_excavation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Open Excavation</FormLabel>
                            <FormDescription>
                              Trenches, holes, or excavation work.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.other_trades"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Other Trades</FormLabel>
                            <FormDescription>
                              Working alongside other contractors.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.ppe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>PPE</FormLabel>
                            <FormDescription>
                              Special personal protective equipment needed.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.pinch_points"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Pinch Points</FormLabel>
                            <FormDescription>
                              Areas where body parts could be caught.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.slips_trips_falls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Slips, Trips, and Falls</FormLabel>
                            <FormDescription>
                              Uneven surfaces or fall hazards.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hazards.working_at_heights"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Working at Heights</FormLabel>
                            <FormDescription>
                              Elevated work areas requiring fall protection.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="additional_comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments or Hazards</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any additional safety concerns or specific hazards not covered above"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveTab("conditions")}
                >
                  Previous
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Safety Plan"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
} 