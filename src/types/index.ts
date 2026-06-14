export type Alignment = 'hero' | 'villain' | 'neutral'
export type CharacterStatus = 'alive' | 'dead' | 'unknown'
export type WatchStatus = 'unwatched' | 'watching' | 'completed'

export interface Serie {
  id: string
  title: string
  cover_url: string | null
  description: string | null
  seasons: number | null
  episodes_per_season: number[] | null
  total_episodes: number | null
  rating: number | null
  watch_status: WatchStatus
  favorite: boolean
  created_at: string
}

export interface Group {
  id: string
  serie_id: string
  name: string
  image_url: string | null
  alignment: Alignment
  created_at: string
}

export interface Character {
  id: string
  serie_id: string
  name: string
  age: number | null
  gender: string | null
  description: string | null
  images: string[]
  alignment: Alignment
  status: CharacterStatus
  first_appearance: string | null
  nickname: string | null
  role: string | null
  favorite: boolean
  created_at: string
}

export interface CharacterGroup {
  character_id: string
  group_id: string
}

export interface CharacterWithRelations extends Character {
  series?: Pick<Serie, 'id' | 'title'>
  groups?: Group[]
}
