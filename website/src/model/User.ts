import mongoose, { Schema, Document } from 'mongoose';

export interface Experience extends Document {
  company: string;
  position: string;
}

interface Badge {
    cluster: string;
    imageUrl: string;
  }
export interface User extends Document {
  clerk_Id: string;
  name: string;
  email: string;
  role: string;
  DOB: Date;
  profileImage: string;
  resume: string;
  atsScore: number;
  skills: string[];
  location: string;
  experience: Experience[];
  courses: string[];
  certificates: string[];
  badges: string[];
}
const BadgeSchema = new Schema({
    cluster: { type: String, required: true },
    imageUrl: { type: String, required: true },
    mintedAt: { type: Date, default: Date.now },
    tokenId: { type: String }
  });

const UserSchema: Schema<User> = new Schema({
  clerk_Id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['USER', 'RECRUITER'], default: 'USER' },
  DOB: { type: Date },
  profileImage: { type: String, required: true },
  resume: { type: String },
  atsScore: { type: Number },
  skills: { type: [String] }, // ✅ fixed
  location: { type: String },
  experience: [{ company: { type: String }, position: { type: String } }],
  courses: [{ type: String }],
  certificates: [{ type: String }],
  badges: [BadgeSchema]
});






  
const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);




export default UserModel;
