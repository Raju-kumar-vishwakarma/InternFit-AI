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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_queries: {
        Row: {
          application_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_queries_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_at: string
          changed_by: string | null
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          status: string
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          id: string
          job_posting_id: string | null
          recommendation_id: string | null
          recruiter_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_posting_id?: string | null
          recommendation_id?: string | null
          recruiter_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_posting_id?: string | null
          recommendation_id?: string | null
          recruiter_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "internship_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          job_posting_id: string | null
          recommendation_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_posting_id?: string | null
          recommendation_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_posting_id?: string | null
          recommendation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "internship_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_ideas: {
        Row: {
          category: string
          created_at: string
          description: string
          how_solves: string | null
          id: string
          is_favorite: boolean | null
          title: string
          user_id: string
          why_useful: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          how_solves?: string | null
          id?: string
          is_favorite?: boolean | null
          title: string
          user_id: string
          why_useful?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          how_solves?: string | null
          id?: string
          is_favorite?: boolean | null
          title?: string
          user_id?: string
          why_useful?: string | null
        }
        Relationships: []
      }
      internship_recommendations: {
        Row: {
          company: string
          created_at: string
          description: string | null
          id: string
          internship_type: string | null
          location: string | null
          match_score: number
          resume_id: string
          skills_matched: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          id?: string
          internship_type?: string | null
          location?: string | null
          match_score: number
          resume_id: string
          skills_matched?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          internship_type?: string | null
          location?: string | null
          match_score?: number
          resume_id?: string
          skills_matched?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_recommendations_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          company: string
          company_image: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          job_type: string | null
          location: string | null
          recruiter_id: string
          requirements: string | null
          salary_range: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          company_image?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          recruiter_id: string
          requirements?: string | null
          salary_range?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          company_image?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          recruiter_id?: string
          requirements?: string | null
          salary_range?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          certifications: Json | null
          country: string | null
          created_at: string
          current_company: string | null
          date_of_birth: string | null
          detailed_education: Json | null
          detailed_experience: Json | null
          education: string | null
          experience_years: number | null
          full_name: string | null
          gender: string | null
          github_url: string | null
          id: string
          languages: string[] | null
          linkedin_url: string | null
          location: string | null
          marital_status: string | null
          phone: string | null
          portfolio_url: string | null
          professional_title: string | null
          projects: Json | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          country?: string | null
          created_at?: string
          current_company?: string | null
          date_of_birth?: string | null
          detailed_education?: Json | null
          detailed_experience?: Json | null
          education?: string | null
          experience_years?: number | null
          full_name?: string | null
          gender?: string | null
          github_url?: string | null
          id?: string
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          marital_status?: string | null
          phone?: string | null
          portfolio_url?: string | null
          professional_title?: string | null
          projects?: Json | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          country?: string | null
          created_at?: string
          current_company?: string | null
          date_of_birth?: string | null
          detailed_education?: Json | null
          detailed_experience?: Json | null
          education?: string | null
          experience_years?: number | null
          full_name?: string | null
          gender?: string | null
          github_url?: string | null
          id?: string
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          marital_status?: string | null
          phone?: string | null
          portfolio_url?: string | null
          professional_title?: string | null
          projects?: Json | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          education: string | null
          experience: string | null
          extracted_text: string | null
          file_name: string
          file_url: string
          id: string
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          education?: string | null
          experience?: string | null
          extracted_text?: string | null
          file_name: string
          file_url: string
          id?: string
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          education?: string | null
          experience?: string | null
          extracted_text?: string | null
          file_name?: string
          file_url?: string
          id?: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "candidate" | "recruiter" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["candidate", "recruiter", "admin"],
    },
  },
} as const
