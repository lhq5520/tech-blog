import { Schema, model } from 'mongoose'

// 1.define interface
interface Comment {
  content: string;
  createdAt: Date;
  postId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId; // Optional for anonymous users
  authorName?: string; // For anonymous users
  authorEmail?: string; // For anonymous users (optional)
  ipAddress?: string; // For rate limiting and deletion verification
  parentCommentId?: Schema.Types.ObjectId; // For nested comments (replies)
}

// 2.create schema, pass down <T>
const CommentSchema = new Schema<Comment>({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  authorName: { type: String, required: false },
  authorEmail: { type: String, required: false },
  ipAddress: { type: String, required: false },
  parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment", required: false },
});

// 3.export model
export const Comment = model<Comment>('Comment', CommentSchema)
