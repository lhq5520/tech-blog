import { Schema, model } from 'mongoose'

// 1.define interface
interface User {
  email: string;
  password?: string;
  googleId?: string;
  createdAt: Date;
}
// 2.create schema, pass down <T>
const userSchema = new Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
})
// 3.export model
export const User = model<User>('User', userSchema)