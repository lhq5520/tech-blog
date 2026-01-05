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
}