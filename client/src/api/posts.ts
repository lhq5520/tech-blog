import { type Post} from '../types';
import {get, post, put, del} from './client'

const POSTS_ENDPOINT = 'api/posts';

interface BlogPublish {
  title: string;
  subtitle: string;
  content: string;
  coverImage?: string;
  tags?: string[];
}

export interface PostsResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

// Get all posts
export const fetchPosts = (): Promise<Post[]> => {
  return get<Post[]>(POSTS_ENDPOINT);
}

//Get all posts with pagination, search, and filters
export const fetchPaginatedPosts = (
  page: number = 1, 
  limit: number = 5,
  search?: string,
  sortBy?: string,
  sortOrder?: string,
  tag?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search && search.trim()) {
    params.append('search', search.trim());
  }
  
  if (tag && tag.trim()) {
    params.append('tag', tag.trim());
  }
  
  if (sortBy) {
    params.append('sortBy', sortBy);
  }
  
  if (sortOrder) {
    params.append('sortOrder', sortOrder);
  }
  
  return get<PostsResponse>(`${POSTS_ENDPOINT}/pagelimit?${params.toString()}`);
};

// Get all unique tags
export const fetchAllTags = (): Promise<{ tags: string[] }> => {
  return get<{ tags: string[] }>(`${POSTS_ENDPOINT}/tags/all`);
};

// Get a single post
export const fetchSinglePost = (blogId:string): Promise<Post> => {
  return get<Post>(`${POSTS_ENDPOINT}/${blogId}`);
}

// publish a blog
export const createPost = (data:BlogPublish): Promise<Post> => {
  return post<Post>(POSTS_ENDPOINT, data);
}

//update a blog
export const updatePost = (blogId:string, data: BlogPublish): Promise<Post> => {
  return put<Post>(`${POSTS_ENDPOINT}/${blogId}`, data);
}

//delete a post
export const deletePost = (blogId: string): Promise<void> => {
  return del(`${POSTS_ENDPOINT}/${blogId}`)
}

