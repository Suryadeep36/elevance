import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(req: Request) {
  const data = await req.json();
  const { clerk_Id, badge } = data;

  if (!clerk_Id || !badge?.cluster || !badge?.imageUrl) {
    return NextResponse.json({ error: 'Missing required badge or user ID' }, { status: 400 });
  }

  await dbConnect();

  try {
    const user = await UserModel.findOne({ clerk_Id });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Optional: prevent duplicate cluster
    const alreadyHasBadge = user.badges.some((b: any) => b.cluster === badge.cluster);
    if (alreadyHasBadge) {
      return NextResponse.json({ message: 'User already has this badge' }, { status: 200 });
    }

    user.badges.push({
      cluster: badge.cluster,
      imageUrl: badge.imageUrl,
      tokenId: badge.tokenId || undefined,
      mintedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({ message: 'Badge added successfully' });
  } catch (err) {
    console.error('Error adding badge:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
