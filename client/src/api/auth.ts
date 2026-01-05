import {get, post} from './client'
import {type User} from '../types'

interface LoginResponse {
  user: User;
}

interface CheckAuthResponse {
  user: User;
}


const AUTH_ENDPOINT = 'api/auth';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return post<LoginResponse>(`${AUTH_ENDPOINT}/login`, {email, password});
}

export const register = async (email: string, password: string): Promise<void> => {
  return post<void>(`${AUTH_ENDPOINT}/register`, {email, password});
}

export const logout = async (): Promise<void> => {
  return post<void>(`${AUTH_ENDPOINT}/logout`);
}

export const checkAuth = async (): Promise<CheckAuthResponse> => {
  return get<CheckAuthResponse>(`${AUTH_ENDPOINT}/check`);
}
