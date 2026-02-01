export interface UploadImageResponse {
  url: string;
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
  result?: string;
}

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('upload', file);

  const API_URL = import.meta.env.VITE_API_URL;
  
  if (!API_URL) {
    throw new Error('API URL is not configured. Please set VITE_API_URL in your environment variables.');
  }

  try {
    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.url) {
      throw new Error('Upload succeeded but no URL was returned');
    }

    return data;
  } catch (error: any) {
    console.error('Upload error details:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<DeleteImageResponse> => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  if (!API_URL) {
    throw new Error('API URL is not configured. Please set VITE_API_URL in your environment variables.');
  }

  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    throw new Error('Invalid Cloudinary URL');
  }

  try {
    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Delete failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Delete error details:', error);
    throw error;
  }
};
