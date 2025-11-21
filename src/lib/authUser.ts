// lib/authUser.ts
export const STORAGE_KEY = 'authUser'

export type AuthUser = {
  idUser: string
  name: string
  surname: string
  email: string
  country: string
  country2: string
  mobileE164: string
  sessionToken?: string
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  try {
    // Prima sessionStorage (login la scrive sicuramente)
    const fromSession = window.sessionStorage.getItem(STORAGE_KEY)
    if (fromSession) return JSON.parse(fromSession) as AuthUser

    // Poi localStorage (abbiamo messo anche lì nel login)
    const fromLocal = window.localStorage.getItem(STORAGE_KEY)
    if (fromLocal) return JSON.parse(fromLocal) as AuthUser

    return null
  } catch (e) {
    console.warn('Error reading authUser from storage', e)
    return null
  }
}
