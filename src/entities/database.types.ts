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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          accion: string
          created_at: string | null
          datos_antes: Json | null
          datos_despues: Json | null
          id: string
          registro_id: string
          tabla: string
          usuario_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string | null
          datos_antes?: Json | null
          datos_despues?: Json | null
          id?: string
          registro_id: string
          tabla: string
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string | null
          datos_antes?: Json | null
          datos_despues?: Json | null
          id?: string
          registro_id?: string
          tabla?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          is_active: boolean | null
          nombre: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          contenido: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          imagen_url: string | null
          leido: boolean | null
          order_id: string
          sender_id: string
        }
        Insert: {
          contenido?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          imagen_url?: string | null
          leido?: boolean | null
          order_id: string
          sender_id: string
        }
        Update: {
          contenido?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          imagen_url?: string | null
          leido?: boolean | null
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cliente_id: string
          comision_plataforma: number | null
          completed_at: string | null
          created_at: string | null
          deleted_at: string | null
          estado: Database["public"]["Enums"]["order_status"]
          id: string
          monto_proveedor: number | null
          notas_cliente: string | null
          precio_final: number
          proveedor_id: string
          razon_cancelacion:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          service_id: string
          stripe_payment_intent: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          comision_plataforma?: number | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          id?: string
          monto_proveedor?: number | null
          notas_cliente?: string | null
          precio_final: number
          proveedor_id: string
          razon_cancelacion?:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          service_id: string
          stripe_payment_intent?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          comision_plataforma?: number | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          id?: string
          monto_proveedor?: number | null
          notas_cliente?: string | null
          precio_final?: number
          proveedor_id?: string
          razon_cancelacion?:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          service_id?: string
          stripe_payment_intent?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          ciudad: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          nombre: string
          rating_promedio: number | null
          total_reviews: number | null
          total_servicios: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          ciudad?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id: string
          is_active?: boolean | null
          nombre?: string
          rating_promedio?: number | null
          total_reviews?: number | null
          total_servicios?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          ciudad?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          rating_promedio?: number | null
          total_reviews?: number | null
          total_servicios?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comentario: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          order_id: string
          rating: number
          respuesta: string | null
          reviewed_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          comentario?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          order_id: string
          rating: number
          respuesta?: string | null
          reviewed_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          comentario?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          order_id?: string
          rating?: number
          respuesta?: string | null
          reviewed_id?: string
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          created_at: string | null
          id: string
          orden: number
          service_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          orden?: number
          service_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          orden?: number
          service_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string | null
          deleted_at: string | null
          descripcion: string
          estado: Database["public"]["Enums"]["service_status"]
          id: string
          precio: number | null
          razon_rechazo: string | null
          tipo_precio: Database["public"]["Enums"]["service_price_type"]
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          deleted_at?: string | null
          descripcion: string
          estado?: Database["public"]["Enums"]["service_status"]
          id?: string
          precio?: number | null
          razon_rechazo?: string | null
          tipo_precio?: Database["public"]["Enums"]["service_price_type"]
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string
          estado?: Database["public"]["Enums"]["service_status"]
          id?: string
          precio?: number | null
          razon_rechazo?: string | null
          tipo_precio?: Database["public"]["Enums"]["service_price_type"]
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_user_id_fkey"
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      cancellation_reason:
        | "cliente_cancelo"
        | "proveedor_cancelo"
        | "disputa_resuelta_cliente"
        | "disputa_resuelta_proveedor"
        | "inactividad"
      order_status:
        | "pendiente"
        | "aceptada"
        | "en_progreso"
        | "completada"
        | "cancelada"
        | "en_disputa"
      service_price_type: "fijo" | "por_hora" | "cotizacion"
      service_status: "activo" | "pausado" | "pendiente_revision" | "rechazado"
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
      cancellation_reason: [
        "cliente_cancelo",
        "proveedor_cancelo",
        "disputa_resuelta_cliente",
        "disputa_resuelta_proveedor",
        "inactividad",
      ],
      order_status: [
        "pendiente",
        "aceptada",
        "en_progreso",
        "completada",
        "cancelada",
        "en_disputa",
      ],
      service_price_type: ["fijo", "por_hora", "cotizacion"],
      service_status: ["activo", "pausado", "pendiente_revision", "rechazado"],
    },
  },
} as const
