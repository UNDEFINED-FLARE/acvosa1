export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          attendance_code: string | null
          attendance_method: Database["public"]["Enums"]["attendance_method"]
          capacity: number
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          created_by: string | null
          date: string
          description: string
          end_time: string
          id: string
          image_seed: string | null
          image_url: string | null
          name: string
          organizer: string
          registration_deadline: string
          requirements: string[]
          start_time: string
          venue: string
        }
        Insert: {
          attendance_code?: string | null
          attendance_method?: Database["public"]["Enums"]["attendance_method"]
          capacity: number
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          created_by?: string | null
          date: string
          description?: string
          end_time: string
          id?: string
          image_seed?: string | null
          image_url?: string | null
          name: string
          organizer: string
          registration_deadline: string
          requirements?: string[]
          start_time: string
          venue: string
        }
        Update: {
          attendance_code?: string | null
          attendance_method?: Database["public"]["Enums"]["attendance_method"]
          capacity?: number
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          end_time?: string
          id?: string
          image_seed?: string | null
          image_url?: string | null
          name?: string
          organizer?: string
          registration_deadline?: string
          requirements?: string[]
          start_time?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "activity_participants"
            referencedColumns: ["user_id"]
          },
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
          check_in_time: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Insert: {
          activity_id: string
          check_in_time: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Update: {
          activity_id?: string
          check_in_time?: string
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
            foreignKeyName: "attendance_records_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activity_participants"
            referencedColumns: ["user_id"]
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
          {
            foreignKeyName: "deadlines_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      history_events: {
        Row: {
          description: string
          id: string
          title: string
          year: string
        }
        Insert: {
          description?: string
          id?: string
          title: string
          year: string
        }
        Update: {
          description?: string
          id?: string
          title?: string
          year?: string
        }
        Relationships: []
      }
      impact_snapshots: {
        Row: {
          activities: number
          attendance_rate: number
          communities: number
          id: string
          participants: number
          projects: number
          volunteer_hours: number
          year: string
        }
        Insert: {
          activities?: number
          attendance_rate?: number
          communities?: number
          id?: string
          participants?: number
          projects?: number
          volunteer_hours?: number
          year: string
        }
        Update: {
          activities?: number
          attendance_rate?: number
          communities?: number
          id?: string
          participants?: number
          projects?: number
          volunteer_hours?: number
          year?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          price: number
          rating: number | null
          review_count: number | null
          seller_id: string | null
          shop_key: string | null
          shop_name: string | null
          sold_out: boolean | null
          status: string | null
          stock: number | null
          title: string
          whatsapp: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          price: number
          rating?: number | null
          review_count?: number | null
          seller_id?: string | null
          shop_key?: string | null
          shop_name?: string | null
          sold_out?: boolean | null
          status?: string | null
          stock?: number | null
          title: string
          whatsapp?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          price?: number
          rating?: number | null
          review_count?: number | null
          seller_id?: string | null
          shop_key?: string | null
          shop_name?: string | null
          sold_out?: boolean | null
          status?: string | null
          stock?: number | null
          title?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          activities_attended: number
          email: string
          faculty: string | null
          id: string
          joined: string
          name: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          student_number: string | null
          volunteer_hours: number
        }
        Insert: {
          activities_attended?: number
          email: string
          faculty?: string | null
          id?: string
          joined?: string
          name: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          student_number?: string | null
          volunteer_hours?: number
        }
        Update: {
          activities_attended?: number
          email?: string
          faculty?: string | null
          id?: string
          joined?: string
          name?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          student_number?: string | null
          volunteer_hours?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          activity_id: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          message: string
          read: boolean
          recipient_id: string
          title: string
        }
        Insert: {
          activity_id?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          message: string
          read?: boolean
          recipient_id: string
          title: string
        }
        Update: {
          activity_id?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          recipient_id?: string
          title?: string
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
            foreignKeyName: "notifications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "activity_participants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_location: string | null
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string | null
          note: string | null
          order_id: string
          payment_method: string | null
          payment_status: string | null
          price: number | null
          product_id: string | null
          product_title: string | null
          quantity: number | null
          seller_whatsapp: string | null
          shop_id: string | null
          shop_name: string | null
          status: string | null
          total: number | null
        }
        Insert: {
          buyer_location?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          note?: string | null
          order_id: string
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          product_id?: string | null
          product_title?: string | null
          quantity?: number | null
          seller_whatsapp?: string | null
          shop_id?: string | null
          shop_name?: string | null
          status?: string | null
          total?: number | null
        }
        Update: {
          buyer_location?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          note?: string | null
          order_id?: string
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          product_id?: string | null
          product_title?: string | null
          quantity?: number | null
          seller_whatsapp?: string | null
          shop_id?: string | null
          shop_name?: string | null
          status?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      Products: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_seed: string | null
          created_at: string
          email: string
          faculty: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["member_status"]
          student_number: string | null
        }
        Insert: {
          avatar_seed?: string | null
          created_at?: string
          email: string
          faculty?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["member_status"]
          student_number?: string | null
        }
        Update: {
          avatar_seed?: string | null
          created_at?: string
          email?: string
          faculty?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["member_status"]
          student_number?: string | null
        }
        Relationships: []
      }
      project_phases: {
        Row: {
          date: string
          description: string
          done: boolean
          id: string
          position: number
          project_id: string
          title: string
        }
        Insert: {
          date: string
          description?: string
          done?: boolean
          id?: string
          position?: number
          project_id: string
          title: string
        }
        Update: {
          date?: string
          description?: string
          done?: boolean
          id?: string
          position?: number
          project_id?: string
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
      project_team: {
        Row: {
          id: string
          name: string
          project_id: string
          role: string
        }
        Insert: {
          id?: string
          name: string
          project_id: string
          role: string
        }
        Update: {
          id?: string
          name?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          community: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          documents: string[]
          evidence_count: number
          id: string
          location: string
          objectives: string[]
          participants: number
          results: string[]
          satisfaction: number
          sessions: number
          status: Database["public"]["Enums"]["project_status"]
          title: string
          volunteers: number
        }
        Insert: {
          community: string
          created_at?: string
          created_by?: string | null
          date: string
          description?: string
          documents?: string[]
          evidence_count?: number
          id?: string
          location: string
          objectives?: string[]
          participants?: number
          results?: string[]
          satisfaction?: number
          sessions?: number
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          volunteers?: number
        }
        Update: {
          community?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          documents?: string[]
          evidence_count?: number
          id?: string
          location?: string
          objectives?: string[]
          participants?: number
          results?: string[]
          satisfaction?: number
          sessions?: number
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          volunteers?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "activity_participants"
            referencedColumns: ["user_id"]
          },
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
          ticket_code: string
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
            foreignKeyName: "reservations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "activity_participants"
            referencedColumns: ["user_id"]
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
      sellers: {
        Row: {
          category: string | null
          created_at: string | null
          email: string
          id: string
          listings_count: number | null
          location: string | null
          owner_name: string
          shop_name: string
          status: string | null
          whatsapp: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email: string
          id: string
          listings_count?: number | null
          location?: string | null
          owner_name: string
          shop_name: string
          status?: string | null
          whatsapp: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string
          id?: string
          listings_count?: number | null
          location?: string | null
          owner_name?: string
          shop_name?: string
          status?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      stakeholders: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          created_at: string
          focus: string | null
          id: string
          name: string
          relationship: string
          since: string | null
          status: Database["public"]["Enums"]["stakeholder_status"]
          type: Database["public"]["Enums"]["stakeholder_type"]
          unit_id: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          focus?: string | null
          id?: string
          name: string
          relationship?: string
          since?: string | null
          status?: Database["public"]["Enums"]["stakeholder_status"]
          type: Database["public"]["Enums"]["stakeholder_type"]
          unit_id?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          focus?: string | null
          id?: string
          name?: string
          relationship?: string
          since?: string | null
          status?: Database["public"]["Enums"]["stakeholder_status"]
          type?: Database["public"]["Enums"]["stakeholder_type"]
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_staff: {
        Row: {
          category: Database["public"]["Enums"]["unit_staff_category"]
          created_at: string
          email: string | null
          focus: string | null
          id: string
          name: string
          position: number
          status: Database["public"]["Enums"]["member_status"]
          title: string | null
          unit_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["unit_staff_category"]
          created_at?: string
          email?: string | null
          focus?: string | null
          id?: string
          name: string
          position?: number
          status?: Database["public"]["Enums"]["member_status"]
          title?: string | null
          unit_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["unit_staff_category"]
          created_at?: string
          email?: string | null
          focus?: string | null
          id?: string
          name?: string
          position?: number
          status?: Database["public"]["Enums"]["member_status"]
          title?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_staff_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          description: string
          email: string | null
          focus: string
          id: string
          lead: string | null
          name: string
          position: number
          short_name: string
        }
        Insert: {
          created_at?: string
          description?: string
          email?: string | null
          focus?: string
          id?: string
          lead?: string | null
          name: string
          position?: number
          short_name: string
        }
        Update: {
          created_at?: string
          description?: string
          email?: string | null
          focus?: string
          id?: string
          lead?: string | null
          name?: string
          position?: number
          short_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      activities_with_counts: {
        Row: {
          attendance_code: string | null
          attendance_method:
            | Database["public"]["Enums"]["attendance_method"]
            | null
          attended_count: number | null
          capacity: number | null
          category: Database["public"]["Enums"]["activity_category"] | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          end_time: string | null
          id: string | null
          image_seed: string | null
          name: string | null
          no_show_count: number | null
          organizer: string | null
          registration_deadline: string | null
          requirements: string[] | null
          reserved: number | null
          start_time: string | null
          venue: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "activity_participants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_participants: {
        Row: {
          activity_id: string | null
          attended: boolean | null
          check_in_time: string | null
          name: string | null
          reserved: boolean | null
          student_number: string | null
          user_id: string | null
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
            foreignKeyName: "reservations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      broadcast_notification: {
        Args: {
          p_activity_id?: string
          p_category?: Database["public"]["Enums"]["notification_category"]
          p_message: string
          p_title: string
        }
        Returns: number
      }
      cancel_reservation: {
        Args: { p_activity_id: string }
        Returns: undefined
      }
      confirm_attendance: {
        Args: { p_activity_id: string; p_code: string }
        Returns: {
          activity_id: string
          check_in_time: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "attendance_records"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_attendance_code: {
        Args: { p_activity_id: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      reserve_activity: {
        Args: { p_activity_id: string }
        Returns: {
          activity_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["reservation_status"]
          ticket_code: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      activity_category:
        | "Workshops"
        | "Community"
        | "Academic"
        | "Leadership"
        | "Social"
        | "Volunteer"
      app_role: "student" | "admin"
      attendance_method: "QR" | "GPS" | "Bluetooth" | "QR + GPS"
      attendance_status: "present" | "absent" | "pending"
      member_role: "Member" | "Coordinator" | "Volunteer"
      member_status: "active" | "inactive"
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
      stakeholder_status: "active" | "pending" | "dormant"
      stakeholder_type:
        | "Government"
        | "Academic"
        | "NGO"
        | "Industry"
        | "Funder"
        | "Community"
        | "International"
      unit_staff_category:
        | "Permanent Staff"
        | "Postgraduate Committee"
        | "Innovation Champion"
        | "Graduate Trainee"
        | "Intern"
        | "Research Assistant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_category: [
        "Workshops",
        "Community",
        "Academic",
        "Leadership",
        "Social",
        "Volunteer",
      ],
      app_role: ["student", "admin"],
      attendance_method: ["QR", "GPS", "Bluetooth", "QR + GPS"],
      attendance_status: ["present", "absent", "pending"],
      member_role: ["Member", "Coordinator", "Volunteer"],
      member_status: ["active", "inactive"],
      notification_category: [
        "reservation",
        "attendance",
        "deadline",
        "project",
        "reminder",
        "system",
      ],
      priority_level: ["high", "medium", "low"],
      project_status: ["planning", "active", "completed"],
      reservation_status: ["confirmed", "completed", "cancelled"],
      stakeholder_status: ["active", "pending", "dormant"],
      stakeholder_type: [
        "Government",
        "Academic",
        "NGO",
        "Industry",
        "Funder",
        "Community",
        "International",
      ],
      unit_staff_category: [
        "Permanent Staff",
        "Postgraduate Committee",
        "Innovation Champion",
        "Graduate Trainee",
        "Intern",
        "Research Assistant",
      ],
    },
  },
} as const
