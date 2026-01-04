import {type User} from '../types';

const API_URL = import.meta.env.VITE_API_URL;
const endpoint = 'api/profile';

if (!API_URL) {
  console.error("Error: API_URL is not defined in your environment variables.");
  throw new Error("API_URL is not defined. Check your environment variables.");
}

export const fetchUserProfile = async(): Promise<User> => {
  
  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error ('No token found in fetchUserProfile');
  }

  const url = `${API_URL}/${endpoint}`
  try{
    const response = await fetch(url, {
      method:'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok){
      throw new Error (`Failed to fetch user profile: ${response.statusText}`) 
    } else {
      return await response.json();
    }
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    throw error;
  }
}