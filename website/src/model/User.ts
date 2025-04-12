import mongoose, { Schema, Document } from 'mongoose';

export interface Skills extends Document {
    skill: string;
    level: string;
}

export interface Experience extends Document {
    company: string;
    position: string;
    
}

export interface User extends Document {
    clerk_Id: string;
    name: string;
    email: string;
    role: string;      //user,recruiter
    DOB: Date;
    profileImage: string;
    resume: string;
    atsScore: number;
    skills: Skills[];
    location: string;
    experience: Experience[];
    courses: string[];
    certificates: string[];
    bedges: string[];
}


const UserSchema: Schema<User> = new Schema({
    clerk_Id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['USER', 'RECRUITER'], default: 'USER' },
    DOB: { type: Date },
    profileImage: { type: String, required: true },
    resume: { type: String },
    atsScore: { type: Number },
    skills: [{ skill: { type: String }, level: { type: String, required: true } }],
    location: { type: String },
    experience: [{ company: { type: String }, position: { type: String } }],
    courses: [{ type: String }],
    certificates: [{ type: String }],
    bedges: [{ type: String }]
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;