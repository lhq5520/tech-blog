import {type User} from '../types';
import {get} from './client'

const USER_ENDPOINT = 'api/profile';

//get user profile 
export const fetchUserProfile = (): Promise<User> => {
  return get<User>(USER_ENDPOINT);
}