export interface Post {
  _id: string;
  userId: string;
  title: string;
  subtitle: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  views?: number;
  createdAt: string;
}

// Post summary without full content (used for list views and create/update responses)
export interface PostSummary {
  _id: string;
  userId: string;
  title: string;
  subtitle: string;
  coverImage?: string;
  tags?: string[];
  views?: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  postId: string;
  userId?: string | {
    _id: string;
    email: string;
  };
  authorName?: string;
  authorEmail?: string;
  createdAt: string;
  parentCommentId?: string;
  replies?: Comment[]; // Nested replies
}

export type BlogFormData = {
  title: string;
  subtitle: string;
  content: string;
  coverImage?: string;
  tags?: string[];
};