export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      series: {
        Row: {
          id: string
          title: string
          cover_url: string | null
          description: string | null
          seasons: number | null
          episodes_per_season: Json | null
          total_episodes: number | null
          rating: number | null
          watch_status: string
          favorite: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['series']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['series']['Insert']>
      }
      groups: {
        Row: {
          id: string
          serie_id: string
          name: string
          image_url: string | null
          alignment: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      characters: {
        Row: {
          id: string
          serie_id: string
          name: string
          age: number | null
          gender: string | null
          description: string | null
          images: string[]
          alignment: string
          status: string
          first_appearance: string | null
          nickname: string | null
          role: string | null
          favorite: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['characters']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['characters']['Insert']>
      }
      character_groups: {
        Row: { character_id: string; group_id: string }
        Insert: Database['public']['Tables']['character_groups']['Row']
        Update: Partial<Database['public']['Tables']['character_groups']['Row']>
      }
    }
  }
}
