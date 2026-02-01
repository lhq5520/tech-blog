import { type Comment } from '../types';
import { get, post, del } from './client';

const COMMENTS_ENDPOINT = 'api/comments';

// Get all comments for a specific post
export const fetchComments = (postId: string): Promise<Comment[]> => {
  return get<Comment[]>(`${COMMENTS_ENDPOINT}/post/${postId}`);
};

// Create a new comment
export const createComment = (
  postId: string, 
  content: string, 
  authorName?: string, 
  authorEmail?: string,
  parentCommentId?: string
): Promise<Comment> => {
  return post<Comment>(COMMENTS_ENDPOINT, { 
    postId, 
    content,
    authorName,
    authorEmail,
    parentCommentId
  });
};

// Delete a comment
export const deleteComment = (commentId: string): Promise<void> => {
  return del(`${COMMENTS_ENDPOINT}/${commentId}`);
};
