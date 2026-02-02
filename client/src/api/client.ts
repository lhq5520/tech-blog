
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
    
    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      let errorDetails: string | undefined;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.details) {
          errorDetails = errorData.details;
        }
      } catch {
        // If JSON parsing fails, use status text
      }
      
      const error = new Error(errorMessage) as any;
      if (errorDetails) {
        error.details = errorDetails;
      }
      throw error;
    }

    // DELETE returns 204 No Content; avoid parsing empty body
    if (response.status === 204) {
      return undefined as T;
    }

    // Check if response has a body by reading the text first
    // This handles cases where content-length header might be missing (chunked encoding)
    const text = await response.text();
    
    // If body is empty, return undefined
    if (!text || text.trim().length === 0) {
      return undefined as T;
    }

    // Try to parse JSON, with better error handling for large responses
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text length:', text.length);
      console.error('Response text preview:', text.substring(0, 200));
      throw new Error(`Failed to parse server response. The response might be too large or invalid JSON.`);
    }

  } catch(error: any){
    console.error('API request error:', error);
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