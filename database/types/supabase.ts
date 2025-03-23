export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      toolbox_meetings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          job_title: string
          job_description: string
          company: string
          site_address: string
          supervisor_name: string
          supervisor_phone: string
          emergency_site_number: string
          weather_conditions: string
          temperature: number
          road_conditions: string
          lease_conditions: string
          date: string
          time: string
          hazards: {
            confined_space: boolean
            driving: boolean
            electrical_work: boolean
            hand_power_tools: boolean
            heat_cold: boolean
            heavy_lifting: boolean
            mobile_equipment: boolean
            open_excavation: boolean
            other_trades: boolean
            ppe: boolean
            pinch_points: boolean
            slips_trips_falls: boolean
            working_at_heights: boolean
          }
          additional_comments: string
          ai_safety_summary: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          job_title: string
          job_description: string
          company: string
          site_address: string
          supervisor_name: string
          supervisor_phone: string
          emergency_site_number: string
          weather_conditions: string
          temperature: number
          road_conditions: string
          lease_conditions: string
          date: string
          time: string
          hazards: {
            confined_space: boolean
            driving: boolean
            electrical_work: boolean
            hand_power_tools: boolean
            heat_cold: boolean
            heavy_lifting: boolean
            mobile_equipment: boolean
            open_excavation: boolean
            other_trades: boolean
            ppe: boolean
            pinch_points: boolean
            slips_trips_falls: boolean
            working_at_heights: boolean
          }
          additional_comments?: string
          ai_safety_summary?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          job_title?: string
          job_description?: string
          company?: string
          site_address?: string
          supervisor_name?: string
          supervisor_phone?: string
          emergency_site_number?: string
          weather_conditions?: string
          temperature?: number
          road_conditions?: string
          lease_conditions?: string
          date?: string
          time?: string
          hazards?: {
            confined_space?: boolean
            driving?: boolean
            electrical_work?: boolean
            hand_power_tools?: boolean
            heat_cold?: boolean
            heavy_lifting?: boolean
            mobile_equipment?: boolean
            open_excavation?: boolean
            other_trades?: boolean
            ppe?: boolean
            pinch_points?: boolean
            slips_trips_falls?: boolean
            working_at_heights?: boolean
          }
          additional_comments?: string
          ai_safety_summary?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          company: string
          role: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          company: string
          role: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          company?: string
          role?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Insertables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updateables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 