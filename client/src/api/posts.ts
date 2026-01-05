import { type Post} from '../types';
import {get, post, put, del} from './client'

const POSTS_ENDPOINT = 'api/posts';

interface BlogPublish {
  title: string;
  subtitle: string;
  content: string;
}

// Get all posts
export const fetchPosts = (): Promise<Post[]> => {
  return get<Post[]>(POSTS_ENDPOINT);
}

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

