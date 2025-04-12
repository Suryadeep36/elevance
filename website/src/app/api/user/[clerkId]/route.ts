import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import UserModel from '@/models/User';

export async function GET(req: Request, { params }: { params: { clerkId: string } }) {
  try {
    await dbConnect();
    
    if (!params || !params.clerkId) {
      return NextResponse.json({ error: 'Invalid clerk ID parameter' }, { status: 400 });
    }
    
    const user = await UserModel.findOne({ clerk_Id: params.clerkId });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: 'Failed to retrieve user' }, { status: 500 });
  }
}
