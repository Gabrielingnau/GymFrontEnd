import { UserDTO } from "@dtos/UserDTO";
import { ReactNode, createContext, useEffect, useState } from "react";

import { api } from '@services/api'

import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";
import { storageAuthTokenSave, storageAuthTokenGet, storageAuthTokenRemove } from "@storage/storageAuthToken";

export type AuthContextDataProps = {
  user: UserDTO
  isLoadingUserStorageData: boolean
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

type AuthContextProviderProps = {
  children: ReactNode
}

export function AuthContexProvider ( { children }: AuthContextProviderProps ) {

  const [user, setUser] = useState<UserDTO>({} as UserDTO)
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)

  async function userAndTokenUpdate (userData: UserDTO, token: string) {   
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData)
  }

  async function storageUserAndTokenSave  (userData: UserDTO, token: string, refresh_token: string) {   
    try {
      setIsLoadingUserStorageData(true)

      await storageUserSave(userData)
      await storageAuthTokenSave({ token, refresh_token });

    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post('/sessions', {email, password})

      if (data.user && data.token) {
        setIsLoadingUserStorageData(true)

        await storageUserAndTokenSave(data.user, data.token, data.refresh_token);
        userAndTokenUpdate(data.user, data.token)
      }

    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true)

      await storageUserRemove()
      await storageAuthTokenRemove()
      setUser({} as UserDTO)

    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  async function updateUserProfile (userUpdated: UserDTO) {
    try {
      setUser(userUpdated)
      await storageUserSave(userUpdated)
    } catch (error) {
      throw error
    }
  }

  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true)

      const userLogged = await storageUserGet()
      const { token } = await storageAuthTokenGet()

    if(token && userLogged) {
      userAndTokenUpdate(userLogged, token)
    }
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  } 

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut);

    return () => {
      subscribe();
    }
  },[])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoadingUserStorageData,
      updateUserProfile,
      signOut,
      signIn
      }}
      >
      {children}
    </AuthContext.Provider>
  )
}