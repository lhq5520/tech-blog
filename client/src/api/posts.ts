import { type Post} from '../types';
const API_URL = import.meta.env.VITE_API_URL;
const endpoint = 'api/posts';

interface BlogPublish {
  title: string;
  subtitle: string;
  content: string;
}

// Check if API_URL is defined
if (!API_URL) {
  console.error("Error: API_URL is not defined in your environment variables.");
  throw new Error("API_URL is not defined. Check your environment variables.");
  // Exit the process with an error code
}


// Get all posts
export const fetchPosts = async (): Promise<Post[]> => {
  const token = localStorage.getItem("token");

  // Construct the API endpoint URL
  const url = `${API_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      method:'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok){
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    } else {
      return await response.json();
    }

  } catch (error) {
    console.error("Error in fetchPosts:", error);
    throw error;
  }
}

// Get a single post
export const fetchSinglePost = async(blogId:string): Promise<Post> => {
  //get a token
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error('No token found on localstorage. Please check that again.')
  }

  //url assembly
  const url = `${API_URL}/${endpoint}/${blogId}`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok){
      throw new Error (`Failed to fetch single posts: ${response.statusText}`) 
    } else {
      return await response.json();
    }
  } catch (error) {
    console.error("Error in fetchSinglePosts:", error);
    throw error;
  }

}

// publish a blog
export const createPost = async(post:BlogPublish): Promise<Post> => {
  
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error('No token found on localstorage. Please check that again.');
  }

  const url = `${API_URL}/${endpoint}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(post)
    });

    if (!response.ok){
      throw new Error (`Failed to create posts: ${response.statusText}`);
    } else {
      return response.json();
    }
  } catch (error) {
      console.error("Error in createPosts:", error);
      throw error;
  }
}

//update a blog
export const updatePost = async (blogId:string, post: BlogPublish): Promise<Post> => {

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error('No token found on localstorage. Please check that again.');
  }

  const url = `${API_URL}/${endpoint}/${blogId}`;

  try {
    const response = await fetch(url, {
      method:'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${token}`,
      },
      body:JSON.stringify(post)
    });

    if (!response.ok){
      throw new Error (`Failed to update posts: ${response.statusText}`)
    } else{
      return await response.json();
    }
  } catch(error) {
    console.error("Error in updatePosts:", error);
    throw error;
  }
}

//delete a post
export const deletePost = async (blogId: string): Promise<void> => {
  
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error('No token found on localstorage. Please check that again.');
  }

  const url = `${API_URL}/${endpoint}/${blogId}`

  try {
    const response = await fetch (url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.status === 204) {
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete post with id ${blogId}: ${response.statusText}`);
    } 

  } catch (error) {
    console.error("Error in deletePosts:", error);
    throw error;
  }
}

