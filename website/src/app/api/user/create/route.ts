import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(req: Request) {
  const data = await req.json();
  await dbConnect();

  try {
    const existing = await UserModel.findOne({ clerk_Id: data.clerk_Id });
    if (existing) return NextResponse.json({ msg: 'User already exists' }, { status: 200 });

    const user = await UserModel.create(data);
    return NextResponse.json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
