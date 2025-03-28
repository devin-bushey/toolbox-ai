"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Loader2, RefreshCw, Zap } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { cn } from "@/utils/class-names";
import { format } from "date-fns";
import { HazardAnalysisResult } from "../_tools/analyze-job-hazards";

// Weather API types
interface WeatherData {
  weather_conditions: string;
  temperature: number;
  road_conditions?: string;
}

// Cache for weather data to avoid unnecessary API calls
interface WeatherCache {
  address: string;
  data: WeatherData;
  timestamp: number;
}

// Function to fetch weather data by address
async function fetchWeatherByAddress(address: string): Promise<WeatherData> {
  try {
    const response = await fetch(`/toolbox/api/weather?address=${encodeURIComponent(address)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

// Function to analyze hazards using AI
async function analyzeHazards(
  jobDescription: string, 
  weatherConditions: string, 
  temperature: number, 
  roadConditions?: string
): Promise<HazardAnalysisResult | null> {
  try {
    const response = await fetch('/toolbox/api/analyze-hazards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_description: jobDescription,
        weather_conditions: weatherConditions,
        temperature,
        road_conditions: roadConditions,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze hazards');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing hazards:', error);
    return null;
  }
}

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
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isAnalyzingHazards, setIsAnalyzingHazards] = useState(false);
  const [weatherCache, setWeatherCache] = useState<WeatherCache | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_title: "Pipeline Installation Project",
      job_description: "Installation of 24-inch diameter pipeline including excavation, welding, and backfilling operations. Project involves heavy equipment operation and confined space entry.",
      company: "MoCo Construction Ltd.",
      site_address: "555 Saddledome Rise SE, Calgary, AB T2G 2W1",
      supervisor_name: "Sqcuff Mo",
      supervisor_phone: "403-555-0123",
      emergency_site_number: "911",
      weather_conditions: "Partly Cloudy",
      temperature: 22,
      road_conditions: "Dry, well-maintained",
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

      // Show a loading toast that will be dismissed on success or replaced with an error
      const loadingToast = toast.loading("Generating safety plan...");

      const response = await fetch("/toolbox/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || "Failed to create toolbox meeting");
      }

      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success("Safety plan generated successfully!");

      const result = await response.json();
      router.push(`/toolbox/meetings/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Show error toast with the specific error message
      toast.error(`Failed to generate safety plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Function to fetch and update weather data
  const fetchWeatherData = async (forceRefresh = false) => {
    const siteAddress = form.getValues("site_address");
    
    if (!siteAddress || siteAddress.length < 5) {
      toast.error("Please enter a valid site address first");
      return false;
    }
    
    // Check cache first if not forcing a refresh
    if (!forceRefresh && weatherCache && weatherCache.address === siteAddress) {
      // Use cached data if it's less than 30 minutes old
      const cacheAge = Date.now() - weatherCache.timestamp;
      const cacheValidMinutes = 30; // Cache valid for 30 minutes
      
      if (cacheAge < cacheValidMinutes * 60 * 1000) {
        // Update form with cached weather data
        form.setValue("weather_conditions", weatherCache.data.weather_conditions);
        form.setValue("temperature", weatherCache.data.temperature);
        
        if (weatherCache.data.road_conditions) {
          form.setValue("road_conditions", weatherCache.data.road_conditions);
        }
        
        toast.success("Weather data loaded from cache");
        return true;
      }
    }
    
    setIsLoadingWeather(true);
    
    try {
      const weatherData = await fetchWeatherByAddress(siteAddress);
      
      // Update form with weather data
      form.setValue("weather_conditions", weatherData.weather_conditions);
      form.setValue("temperature", weatherData.temperature);
      
      if (weatherData.road_conditions) {
        form.setValue("road_conditions", weatherData.road_conditions);
      }
      
      // Cache the weather data
      setWeatherCache({
        address: siteAddress,
        data: weatherData,
        timestamp: Date.now()
      });
      
      toast.success("Weather data updated successfully");
      return true;
    } catch (error) {
      toast.error("Failed to fetch weather data. Please enter manually.");
      return false;
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Function to refresh weather data
  const refreshWeatherData = () => fetchWeatherData(true);

  // Handle next button click on Job Details tab
  const handleNextFromJobDetails = async () => {
    // Validate job details fields first
    const jobDetailsFields = ["job_title", "job_description", "company", "site_address", "supervisor_name", "supervisor_phone", "emergency_site_number"];
    const isValid = await form.trigger(jobDetailsFields as any);
    
    if (!isValid) {
      // Focus on the first error field
      setTimeout(() => {
        const firstErrorField = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
      }, 100);
      return;
    }
    
    // If form valid, fetch weather data
    try {
      setIsLoadingWeather(true);
      
      // Attempt to fetch weather
      await fetchWeatherData();
      
      // Move to next tab regardless of weather fetch success
      setActiveTab("conditions");
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Function to analyze hazards and update form values
  const analyzeAndUpdateHazards = async () => {
    const jobDescription = form.getValues("job_description");
    const weatherConditions = form.getValues("weather_conditions");
    const temperature = form.getValues("temperature");
    const roadConditions = form.getValues("road_conditions");
    
    if (!jobDescription || jobDescription.length < 5) {
      toast.error("Please enter a valid job description first");
      return false;
    }
    
    setIsAnalyzingHazards(true);
    
    try {
      const analysis = await analyzeHazards(
        jobDescription,
        weatherConditions,
        temperature,
        roadConditions
      );
      
      if (!analysis) {
        throw new Error("Failed to analyze hazards");
      }
      
      // Update form with hazard analysis
      if (analysis.hazards) {
        Object.entries(analysis.hazards).forEach(([key, value]) => {
          form.setValue(`hazards.${key}` as any, value);
        });
      }
      
      if (analysis.additional_comments) {
        form.setValue("additional_comments", analysis.additional_comments);
      }
      
      toast.success("Hazards analyzed and updated");
      return true;
    } catch (error) {
      toast.error("Failed to analyze hazards. Please check manually.");
      return false;
    } finally {
      setIsAnalyzingHazards(false);
    }
  };

  // Handle next button click from Conditions tab to Hazards tab
  const handleNextFromConditions = async () => {
    // Validate conditions fields first
    const conditionsFields = ["date", "time", "weather_conditions", "temperature"];
    const isValid = await form.trigger(conditionsFields as any);
    
    if (!isValid) {
      // Focus on the first error field
      setTimeout(() => {
        const firstErrorField = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
      }, 100);
      return;
    }
    
    // If form valid, analyze hazards
    try {
      setIsAnalyzingHazards(true);
      
      // Attempt to analyze hazards with AI
      await analyzeAndUpdateHazards();
      
      // Move to next tab regardless of analysis success
      setActiveTab("hazards");
    } catch (error) {
      console.error("Error analyzing hazards:", error);
      setActiveTab("hazards");
    }
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
                            className="min-h-[150px]"
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
                  onClick={handleNextFromJobDetails}
                  disabled={isLoadingWeather}
                >
                  {isLoadingWeather ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching Weather...
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="conditions" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Site Conditions</CardTitle>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={refreshWeatherData}
                    disabled={isLoadingWeather}
                    className="h-8"
                  >
                    {isLoadingWeather ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Update Weather
                      </>
                    )}
                  </Button>
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
                  onClick={handleNextFromConditions}
                  disabled={isAnalyzingHazards}
                >
                  {isAnalyzingHazards ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Hazards...
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="hazards" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Hazards Assessment</CardTitle>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={analyzeAndUpdateHazards}
                    disabled={isAnalyzingHazards}
                    className="h-8"
                  >
                    {isAnalyzingHazards ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        AI Update
                      </>
                    )}
                  </Button>
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
                            className="min-h-[150px]"
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