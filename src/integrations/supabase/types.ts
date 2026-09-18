export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          budget: number;
          client_id: string;
          client_name: string;
          contact_email: string;
          created_at: string;
          creator_id: string;
          creator_name: string;
          expected_delivery_date: string;
          gig_id: string;
          gig_title: string;
          id: string;
          preferred_start_date: string;
          project_title: string;
          reference_link: string | null;
          reference_number: string;
          requirements: string;
          status: Database["public"]["Enums"]["booking_status"];
          updated_at: string;
        };
        Insert: {
          budget: number;
          client_id: string;
          client_name?: string;
          contact_email: string;
          created_at?: string;
          creator_id: string;
          creator_name?: string;
          expected_delivery_date: string;
          gig_id: string;
          gig_title: string;
          id?: string;
          preferred_start_date: string;
          project_title: string;
          reference_link?: string | null;
          reference_number?: string;
          requirements: string;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
        };
        Update: {
          budget?: number;
          client_id?: string;
          client_name?: string;
          contact_email?: string;
          created_at?: string;
          creator_id?: string;
          creator_name?: string;
          expected_delivery_date?: string;
          gig_id?: string;
          gig_title?: string;
          id?: string;
          preferred_start_date?: string;
          project_title?: string;
          reference_link?: string | null;
          reference_number?: string;
          requirements?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_gig_id_fkey";
            columns: ["gig_id"];
            isOneToOne: false;
            referencedRelation: "gigs";
            referencedColumns: ["id"];
          },
        ];
      };
      gigs: {
        Row: {
          category: string;
          cover_image_url: string | null;
          created_at: string;
          creator_id: string;
          creator_name: string;
          delivery_days: number;
          description: string;
          id: string;
          is_active: boolean;
          rate: number;
          rate_type: Database["public"]["Enums"]["rate_type"];
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          cover_image_url?: string | null;
          created_at?: string;
          creator_id: string;
          creator_name?: string;
          delivery_days: number;
          description: string;
          id?: string;
          is_active?: boolean;
          rate: number;
          rate_type?: Database["public"]["Enums"]["rate_type"];
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          cover_image_url?: string | null;
          created_at?: string;
          creator_id?: string;
          creator_name?: string;
          delivery_days?: number;
          description?: string;
          id?: string;
          is_active?: boolean;
          rate?: number;
          rate_type?: Database["public"]["Enums"]["rate_type"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "creator" | "client";
      booking_status: "pending" | "accepted" | "declined";
      rate_type: "fixed" | "hourly";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["creator", "client"],
      booking_status: ["pending", "accepted", "declined"],
      rate_type: ["fixed", "hourly"],
    },
  },
} as const;
