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
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          student_id: string
          full_name: string
          course: string | null
          mobile: string | null
          email: string | null
          profile_img_url: string | null
          current_points: number
          lifetime_points: number
          tick_type: string | null
          joined_at: string
          password_plain: string | null
        }
        Insert: {
          id: string
          auth_user_id?: string | null
          student_id: string
          full_name: string
          course?: string | null
          mobile?: string | null
          email?: string | null
          profile_img_url?: string | null
          current_points?: number
          lifetime_points?: number
          tick_type?: string | null
          joined_at?: string
          password_plain?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          student_id?: string
          full_name?: string
          course?: string | null
          mobile?: string | null
          email?: string | null
          profile_img_url?: string | null
          current_points?: number
          lifetime_points?: number
          tick_type?: string | null
          joined_at?: string
          password_plain?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_auth_user_id_fkey"
            columns: ["auth_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_checkins: {
        Row: {
          id: number
          user_id: string
          checkin_date: string
          points_awarded: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          checkin_date: string
          points_awarded?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          checkin_date?: string
          points_awarded?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_streaks: {
        Row: {
          user_id: string
          current_streak: number
          last_checkin_date: string | null
        }
        Insert: {
          user_id: string
          current_streak?: number
          last_checkin_date?: string | null
        }
        Update: {
          user_id?: string
          current_streak?: number
          last_checkin_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_at: string
          location: string | null
          poster_url: string | null
          organizer: string | null
          points_reward: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_at: string
          location?: string | null
          poster_url?: string | null
          organizer?: string | null
          points_reward?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_at?: string
          location?: string | null
          poster_url?: string | null
          organizer?: string | null
          points_reward?: number
        }
        Relationships: []
      }
      event_attendance: {
        Row: {
          id: number
          event_id: string | null
          user_id: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: number
          event_id?: string | null
          user_id?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          event_id?: string | null
          user_id?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string | null
          points_reward: number
          type: string | null
          frequency: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          points_reward?: number
          type?: string | null
          frequency?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          points_reward?: number
          type?: string | null
          frequency?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          id: number
          challenge_id: string | null
          user_id: string | null
          submission_url: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: number
          challenge_id?: string | null
          user_id?: string | null
          submission_url?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          challenge_id?: string | null
          user_id?: string | null
          submission_url?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_quizzes: {
        Row: {
          id: string
          question: string
          options: Json
          correct_option_index: number
          points_reward: number
          available_date: string | null
        }
        Insert: {
          id?: string
          question: string
          options: Json
          correct_option_index: number
          points_reward?: number
          available_date?: string | null
        }
        Update: {
          id?: string
          question?: string
          options?: Json
          correct_option_index?: number
          points_reward?: number
          available_date?: string | null
        }
        Relationships: []
      }
      quiz_submissions: {
        Row: {
          id: number
          quiz_id: string | null
          user_id: string | null
          is_correct: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          quiz_id?: string | null
          user_id?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          quiz_id?: string | null
          user_id?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_quiz_id_fkey"
            columns: ["quiz_id"]
            referencedRelation: "daily_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submissions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stores: {
        Row: {
          id: string
          name: string
          logo_url: string | null
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          store_id: string | null
          name: string
          description: string | null
          original_price: number | null
          discounted_price: number | null
          ecopoints_cost: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          store_id?: string | null
          name: string
          description?: string | null
          original_price?: number | null
          discounted_price?: number | null
          ecopoints_cost?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          store_id?: string | null
          name?: string
          description?: string | null
          original_price?: number | null
          discounted_price?: number | null
          ecopoints_cost?: number | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            referencedRelation: "stores"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: {
        Row: {
          id: number
          product_id: string | null
          image_url: string | null
          sort_order: number | null
        }
        Insert: {
          id?: number
          product_id?: string | null
          image_url?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: number
          product_id?: string | null
          image_url?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          store_id: string | null
          status: string | null
          total_points: number | null
          total_price: number | null
          requires_approval: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          store_id?: string | null
          status?: string | null
          total_points?: number | null
          total_price?: number | null
          requires_approval?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          store_id?: string | null
          status?: string | null
          total_points?: number | null
          total_price?: number | null
          requires_approval?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: number
          order_id: string | null
          product_id: string | null
          quantity: number | null
          price_each: number | null
          points_each: number | null
        }
        Insert: {
          id?: number
          order_id?: string | null
          product_id?: string | null
          quantity?: number | null
          price_each?: number | null
          points_each?: number | null
        }
        Update: {
          id?: number
          order_id?: string | null
          product_id?: string | null
          quantity?: number | null
          price_each?: number | null
          points_each?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      user_feedback: {
        Row: {
          id: number
          user_id: string | null
          rating: number | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_activity_log: {
        Row: {
          id: number
          user_id: string | null
          action_type: string | null
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          action_type?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          action_type?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      points_ledger: {
        Row: {
          id: number
          user_id: string | null
          source_type: string | null
          source_id: string | null
          points_delta: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          source_type?: string | null
          source_id?: string | null
          points_delta?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          source_type?: string | null
          source_id?: string | null
          points_delta?: number | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_impact: {
        Row: {
          user_id: string
          total_plastic_kg: number
          co2_saved_kg: number
          events_attended: number
        }
        Insert: {
          user_id: string
          total_plastic_kg?: number
          co2_saved_kg?: number
          events_attended?: number
        }
        Update: {
          user_id?: string
          total_plastic_kg?: number
          co2_saved_kg?: number
          events_attended?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_impact_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
