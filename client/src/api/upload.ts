import { post } from './client';

export interface UploadImageResponse {
  url: string;
}

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('upload', file);

  const API_URL = import.meta.env.VITE_API_URL;
  
  const response = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return response.json();
};
