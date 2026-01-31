export interface Post {
  _id: string;
  userId: string;
  title: string;
  subtitle: string;
  content: string;
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
}

export type BlogFormData = {
  title: string;
  subtitle: string;
  content: string;
};