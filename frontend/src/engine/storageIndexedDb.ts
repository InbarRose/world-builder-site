import { CURRENT_SCHEMA_VERSION, WorldState } from './types'
import {
  deleteWorld as deleteWorldLocalStorage,
  listSavedWorlds as listSavedWorldsLocalStorage,
  migrateWorldState,
  saveWorld as saveWorldLocalStorage,
} from './storageService'

const DB_NAME = 'world_builder_db'
const DB_VERSION = 1
const STORE_WORLDS = 'worlds'

function isIndexedDbSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

let dbInstance: IDBDatabase | null = null

/**
 * Initializes and returns the IndexedDB database instance.
 */
export async function getIndexedDb(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance
  if (!isIndexedDbSupported()) {
    throw new Error('IndexedDB is not supported in this environment.')
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_WORLDS)) {
        db.createObjectStore(STORE_WORLDS, { keyPath: 'id' })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result
      resolve(dbInstance)
    }

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

/**
 * Asynchronously saves a world into IndexedDB, with transparent fallback to localStorage.
 */
export async function saveWorldAsync(world: WorldState): Promise<WorldState> {
  const prepared: WorldState = {
    ...world,
    updatedAt: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  }

  if (!isIndexedDbSupported()) {
    return saveWorldLocalStorage(prepared)
  }

  try {
    const db = await getIndexedDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WORLDS, 'readwrite')
      const store = tx.objectStore(STORE_WORLDS)
      const putReq = store.put(prepared)

      putReq.onsuccess = () => {
        // Also mirror into localStorage for instant synchronous hydration on initial page render
        try {
          saveWorldLocalStorage(prepared)
        } catch {
          // Ignore localStorage quota limits when IndexedDB succeeds
        }
        resolve(prepared)
      }

      putReq.onerror = () => {
        reject(putReq.error)
      }
    })
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage:', err)
    return saveWorldLocalStorage(prepared)
  }
}

/**
 * Retrieves a single world by ID from IndexedDB or localStorage fallback.
 */
export async function getWorldAsync(id: string): Promise<WorldState | null> {
  if (!isIndexedDbSupported()) {
    const list = listSavedWorldsLocalStorage()
    return list.find((w) => w.id === id) || null
  }

  try {
    const db = await getIndexedDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WORLDS, 'readonly')
      const store = tx.objectStore(STORE_WORLDS)
      const getReq = store.get(id)

      getReq.onsuccess = () => {
        if (!getReq.result) {
          // Fallback check in localStorage
          const localWorlds = listSavedWorldsLocalStorage()
          const found = localWorlds.find((w) => w.id === id) || null
          resolve(found)
        } else {
          resolve(migrateWorldState(getReq.result))
        }
      }

      getReq.onerror = () => {
        reject(getReq.error)
      }
    })
  } catch {
    const localWorlds = listSavedWorldsLocalStorage()
    return localWorlds.find((w) => w.id === id) || null
  }
}

/**
 * Lists all saved worlds asynchronously from IndexedDB.
 */
export async function listWorldsAsync(): Promise<WorldState[]> {
  if (!isIndexedDbSupported()) {
    return listSavedWorldsLocalStorage()
  }

  try {
    const db = await getIndexedDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WORLDS, 'readonly')
      const store = tx.objectStore(STORE_WORLDS)
      const getAllReq = store.getAll()

      getAllReq.onsuccess = () => {
        const results = getAllReq.result || []
        if (results.length === 0) {
          // If IndexedDB is empty, hydrate from existing localStorage
          const localWorlds = listSavedWorldsLocalStorage()
          resolve(localWorlds)
        } else {
          const migrated = results.map(migrateWorldState)
          resolve(migrated)
        }
      }

      getAllReq.onerror = () => {
        reject(getAllReq.error)
      }
    })
  } catch {
    return listSavedWorldsLocalStorage()
  }
}

/**
 * Deletes a world from IndexedDB and local storage.
 */
export async function deleteWorldAsync(id: string): Promise<void> {
  deleteWorldLocalStorage(id)

  if (!isIndexedDbSupported()) return

  try {
    const db = await getIndexedDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WORLDS, 'readwrite')
      const store = tx.objectStore(STORE_WORLDS)
      const delReq = store.delete(id)

      delReq.onsuccess = () => resolve()
      delReq.onerror = () => reject(delReq.error)
    })
  } catch (err) {
    console.warn('IndexedDB delete failed:', err)
  }
}

/**
 * One-time automated migration helper that transfers all legacy localStorage worlds into IndexedDB.
 */
export async function migrateLocalStorageToIndexedDb(): Promise<number> {
  const localWorlds = listSavedWorldsLocalStorage()
  if (localWorlds.length === 0) return 0

  if (!isIndexedDbSupported()) {
    return localWorlds.length
  }

  let migratedCount = 0
  for (const world of localWorlds) {
    try {
      await saveWorldAsync(world)
      migratedCount += 1
    } catch (err) {
      console.error(`Failed to migrate world '${world.name}' into IndexedDB:`, err)
    }
  }
  return migratedCount
}
