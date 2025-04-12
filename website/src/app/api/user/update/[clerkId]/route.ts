import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function PUT(req: Request, { params }: { params: { clerkId: string } }) {
  const updates = await req.json();
  await dbConnect();

  try {
    const user = await UserModel.findOneAndUpdate(
      { clerk_Id: params.clerkId },
      { $set: updates },
      { new: true }
    );
    return NextResponse.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
