export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          attendance_code: string | null
          capacity: number
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          end_time: string
          id: string
          image_seed: string | null
          image_url: string | null
          name: string
          organizer: string | null
          registration_deadline: string | null
          requirements: string[] | null
          start_time: string
          status: Database["public"]["Enums"]["activity_state"]
          venue: string | null
        }
        Insert: {
          attendance_code?: string | null
          capacity?: number
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          end_time: string
          id?: string
          image_seed?: string | null
          image_url?: string | null
          name: string
          organizer?: string | null
          registration_deadline?: string | null
          requirements?: string[] | null
          start_time: string
          status?: Database["public"]["Enums"]["activity_state"]
          venue?: string | null
        }
        Update: {
          attendance_code?: string | null
          capacity?: number
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          image_seed?: string | null
          image_url?: string | null
          name?: string
          organizer?: string | null
          registration_deadline?: string | null
          requirements?: string[] | null
          start_time?: string
          status?: Database["public"]["Enums"]["activity_state"]
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          activity_id: string
          check_in_time: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Insert: {
          activity_id: string
          check_in_time?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Update: {
          activity_id?: string
          check_in_time?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          activity_id: string | null
          date: string
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          title: string
        }
        Insert: {
          activity_id?: string | null
          date: string
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          title: string
        }
        Update: {
          activity_id?: string | null
          date?: string
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      history_events: {
        Row: {
          description: string | null
          id: string
          title: string
          year: string
        }
        Insert: {
          description?: string | null
          id?: string
          title: string
          year: string
        }
        Update: {
          description?: string | null
          id?: string
          title?: string
          year?: string
        }
        Relationships: []
      }
      impact_snapshots: {
        Row: {
          activities: number | null
          attendance_rate: number | null
          communities: number | null
          id: string
          participants: number | null
          projects: number | null
          volunteer_hours: number | null
          year: string
        }
        Insert: {
          activities?: number | null
          attendance_rate?: number | null
          communities?: number | null
          id?: string
          participants?: number | null
          projects?: number | null
          volunteer_hours?: number | null
          year: string
        }
        Update: {
          activities?: number | null
          attendance_rate?: number | null
          communities?: number | null
          id?: string
          participants?: number | null
          projects?: number | null
          volunteer_hours?: number | null
          year?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          activity_id: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_seed: string | null
          created_at: string
          email: string
          faculty: string | null
          id: string
          joined: string
          member_role: Database["public"]["Enums"]["member_role"] | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          student_number: string | null
        }
        Insert: {
          avatar_seed?: string | null
          created_at?: string
          email: string
          faculty?: string | null
          id: string
          joined?: string
          member_role?: Database["public"]["Enums"]["member_role"] | null
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          student_number?: string | null
        }
        Update: {
          avatar_seed?: string | null
          created_at?: string
          email?: string
          faculty?: string | null
          id?: string
          joined?: string
          member_role?: Database["public"]["Enums"]["member_role"] | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          student_number?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          name: string
          project_id: string
          role: string | null
        }
        Insert: {
          id?: string
          name: string
          project_id: string
          role?: string | null
        }
        Update: {
          id?: string
          name?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          date: string | null
          description: string | null
          done: boolean | null
          id: string
          project_id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          date?: string | null
          description?: string | null
          done?: boolean | null
          id?: string
          project_id: string
          sort_order?: number | null
          title: string
        }
        Update: {
          date?: string | null
          description?: string | null
          done?: boolean | null
          id?: string
          project_id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          community: string | null
          created_at: string
          created_by: string | null
          date: string | null
          description: string | null
          documents: string[] | null
          evidence_count: number | null
          id: string
          location: string | null
          objectives: string[] | null
          participants: number | null
          results: string[] | null
          satisfaction: number | null
          sessions: number | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          volunteers: number | null
        }
        Insert: {
          community?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          documents?: string[] | null
          evidence_count?: number | null
          id?: string
          location?: string | null
          objectives?: string[] | null
          participants?: number | null
          results?: string[] | null
          satisfaction?: number | null
          sessions?: number | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          volunteers?: number | null
        }
        Update: {
          community?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          documents?: string[] | null
          evidence_count?: number | null
          id?: string
          location?: string | null
          objectives?: string[] | null
          participants?: number | null
          results?: string[] | null
          satisfaction?: number | null
          sessions?: number | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          volunteers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["reservation_status"]
          ticket_code: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          ticket_code?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          ticket_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      confirm_attendance: { Args: { p_activity_id: string; p_code: string }; Returns: Json }
      generate_attendance_code: { Args: { p_activity_id: string }; Returns: string }
    }
    Enums: {
      activity_category:
        | "Workshops"
        | "Community"
        | "Academic"
        | "Leadership"
        | "Social"
        | "Volunteer"
      activity_state: "upcoming" | "active" | "completed"
      attendance_status: "present" | "absent" | "pending"
      member_role: "Member" | "Coordinator" | "Volunteer"
      notification_category:
        | "reservation"
        | "attendance"
        | "deadline"
        | "project"
        | "reminder"
        | "system"
      priority_level: "high" | "medium" | "low"
      project_status: "planning" | "active" | "completed"
      reservation_status: "confirmed" | "completed" | "cancelled"
      user_role: "student" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
