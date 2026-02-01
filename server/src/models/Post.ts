import { Schema, model } from 'mongoose'

// 1.define interface
interface Post {
  title: string;
  subtitle: string;
  content: string;
  coverImage?: string;
  createdAt: Date;
  userId: Schema.Types.ObjectId;
}
// 2.create schema, pass down <T>
const PostSchema = new Schema <Post>({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// 3.export model
export const Post = model<Post>('Post', PostSchema)