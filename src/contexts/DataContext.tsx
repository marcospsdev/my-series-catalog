import { createContext, useContext, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { guestDb } from '../lib/guestDb'
import { useAuth } from './AuthContext'
import type { Character, Group, Serie, WatchStatus } from '../types'

type SerieInsert = Omit<Serie, 'id' | 'created_at'>
type CharacterInsert = Omit<Character, 'id' | 'created_at'>
type GroupInsert = Omit<Group, 'id' | 'created_at'>

export interface DataContextValue {
  isGuest: boolean

  insertSerie(data: SerieInsert): Promise<void>
  updateSerie(id: string, data: Partial<SerieInsert>): Promise<void>
  deleteSerieCascade(serieId: string, characterIds: string[]): Promise<void>
  updateWatchStatus(serieId: string, status: WatchStatus): Promise<void>

  insertCharacter(data: CharacterInsert): Promise<Character>
  updateCharacter(id: string, data: Partial<CharacterInsert>): Promise<void>
  deleteCharacterCascade(characterId: string): Promise<void>

  insertGroup(data: GroupInsert): Promise<void>
  updateGroup(id: string, data: Partial<GroupInsert>): Promise<void>
  deleteGroupCascade(groupId: string): Promise<void>

  getCharacterGroups(characterId: string): Promise<Group[]>
  getCharacterGroupIds(characterId: string): Promise<string[]>
  getGroupsForSerie(serieId: string): Promise<Group[]>
  getGroupCharacters(groupId: string): Promise<Character[]>
  setCharacterGroups(characterId: string, groupIds: string[]): Promise<void>

  toggleFavorite(table: 'series' | 'characters', id: string, value: boolean): Promise<void>
}

const DataContext = createContext<DataContextValue>(null!)
export function useDb() { return useContext(DataContext) }

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isGuest } = useAuth()

  const value = useMemo<DataContextValue>(() => {
    if (isGuest) {
      return {
        isGuest: true,

        async insertSerie(data) { guestDb.insert('series', data) },
        async updateSerie(id, data) { guestDb.update('series', id, data) },
        async deleteSerieCascade(serieId, characterIds) {
          guestDb.deleteWhereIn('character_groups', 'character_id', characterIds)
          guestDb.deleteWhere('characters', 'serie_id', serieId)
          guestDb.deleteWhere('groups', 'serie_id', serieId)
          guestDb.delete('series', serieId)
        },
        async updateWatchStatus(id, status) { guestDb.update('series', id, { watch_status: status }) },

        async insertCharacter(data) {
          return guestDb.insert('characters', data) as unknown as Character
        },
        async updateCharacter(id, data) { guestDb.update('characters', id, data) },
        async deleteCharacterCascade(characterId) {
          guestDb.deleteWhere('character_groups', 'character_id', characterId)
          guestDb.delete('characters', characterId)
        },

        async insertGroup(data) { guestDb.insert('groups', data) },
        async updateGroup(id, data) { guestDb.update('groups', id, data) },
        async deleteGroupCascade(groupId) {
          guestDb.deleteWhere('character_groups', 'group_id', groupId)
          guestDb.delete('groups', groupId)
        },

        async getCharacterGroups(characterId) {
          const cgRows = guestDb.getWhere<{ group_id: string }>('character_groups', 'character_id', characterId)
          const ids = new Set(cgRows.map(r => r.group_id))
          return guestDb.getAll<Group>('groups').filter(g => ids.has(g.id))
        },
        async getCharacterGroupIds(characterId) {
          return guestDb.getWhere<{ group_id: string }>('character_groups', 'character_id', characterId).map(r => r.group_id)
        },
        async getGroupsForSerie(serieId) {
          return guestDb.getWhere<Group>('groups', 'serie_id', serieId)
            .sort((a, b) => a.name.localeCompare(b.name))
        },
        async getGroupCharacters(groupId) {
          const cgRows = guestDb.getWhere<{ character_id: string }>('character_groups', 'group_id', groupId)
          const ids = new Set(cgRows.map(r => r.character_id))
          return guestDb.getAll<Character>('characters').filter(c => ids.has(c.id))
        },
        async setCharacterGroups(characterId, groupIds) {
          guestDb.deleteWhere('character_groups', 'character_id', characterId)
          groupIds.forEach(gid => guestDb.insert('character_groups', { character_id: characterId, group_id: gid }))
        },

        async toggleFavorite(table, id, value) { guestDb.update(table, id, { favorite: value }) },
      }
    }

    // ── Supabase mode ─────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    return {
      isGuest: false,

      async insertSerie(data) {
        const { error } = await db.from('series').insert(data)
        if (error) throw new Error(error.message)
      },
      async updateSerie(id, data) {
        const { error } = await db.from('series').update(data).eq('id', id)
        if (error) throw new Error(error.message)
      },
      async deleteSerieCascade(serieId, characterIds) {
        if (characterIds.length) {
          await db.from('character_groups').delete().in('character_id', characterIds)
          await db.from('characters').delete().eq('serie_id', serieId)
        }
        await db.from('groups').delete().eq('serie_id', serieId)
        await db.from('series').delete().eq('id', serieId)
      },
      async updateWatchStatus(id, status) {
        await db.from('series').update({ watch_status: status }).eq('id', id)
      },

      async insertCharacter(data) {
        const { data: d, error } = await db.from('characters').insert(data).select().single()
        if (error) throw new Error(error.message)
        return d as Character
      },
      async updateCharacter(id, data) {
        const { error } = await db.from('characters').update(data).eq('id', id)
        if (error) throw new Error(error.message)
      },
      async deleteCharacterCascade(characterId) {
        await db.from('character_groups').delete().eq('character_id', characterId)
        await db.from('characters').delete().eq('id', characterId)
      },

      async insertGroup(data) {
        const { error } = await db.from('groups').insert(data)
        if (error) throw new Error(error.message)
      },
      async updateGroup(id, data) {
        const { error } = await db.from('groups').update(data).eq('id', id)
        if (error) throw new Error(error.message)
      },
      async deleteGroupCascade(groupId) {
        await db.from('character_groups').delete().eq('group_id', groupId)
        await db.from('groups').delete().eq('id', groupId)
      },

      async getCharacterGroups(characterId) {
        const { data } = await db.from('character_groups').select('groups(*)').eq('character_id', characterId)
        return ((data ?? []) as { groups: Group }[]).map(d => d.groups).filter(Boolean) as Group[]
      },
      async getCharacterGroupIds(characterId) {
        const { data } = await db.from('character_groups').select('group_id').eq('character_id', characterId)
        return ((data ?? []) as { group_id: string }[]).map(d => d.group_id)
      },
      async getGroupsForSerie(serieId) {
        const { data } = await db.from('groups').select('*').eq('serie_id', serieId).order('name', { ascending: true })
        return (data as Group[]) ?? []
      },
      async getGroupCharacters(groupId) {
        const { data } = await db.from('character_groups').select('characters(*)').eq('group_id', groupId)
        return ((data ?? []) as { characters: Character }[]).map(d => d.characters).filter(Boolean) as Character[]
      },
      async setCharacterGroups(characterId, groupIds) {
        const { error: delErr } = await db.from('character_groups').delete().eq('character_id', characterId)
        if (delErr) throw new Error(delErr.message)
        if (groupIds.length) {
          const rows = groupIds.map(gid => ({ character_id: characterId, group_id: gid }))
          const { error: insErr } = await db.from('character_groups').insert(rows)
          if (insErr) throw new Error(insErr.message)
        }
      },

      async toggleFavorite(table, id, value) {
        await db.from(table).update({ favorite: value }).eq('id', id)
      },
    }
  }, [isGuest])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
