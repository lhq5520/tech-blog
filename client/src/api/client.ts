
const API_URL = import.meta.env.VITE_API_URL;

// Check if API_URL is defined
if (!API_URL) {
  console.error("Error: API_URL is not defined in your environment variables.");
  throw new Error("API_URL is not defined. Check your environment variables.");
  // Exit the process with an error code
}

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if(!response.ok){
      throw new Error (`something wrong with response  ${response.statusText}}` )
    }
    return response.json();

  } catch(error: any){
    throw error;
  }
};

export const get = <T>(endpoint: string): Promise<T> => {
  return request<T>(endpoint, { method: 'GET' });
}

export const post = <T>(endpoint: string, data?: any): Promise<T> => {
  return request<T> (endpoint, {method: 'POST', body: data});
}

export const put = <T>(endpoint: string, data: any): Promise<T> => {
  return request<T> (endpoint, {method: 'PUT', body: data});
}

export const del = (endpoint: string): Promise<void> => {
  return request(endpoint, {method: 'DELETE'});
}