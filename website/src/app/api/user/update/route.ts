import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function PUT(req: Request) {
  try {
    await dbConnect();
    
    const data = await req.json();
    
    if (!data.clerk_Id) {
      return NextResponse.json({ error: 'Clerk ID is required' }, { status: 400 });
    }
    
    // Find the user first
    const user = await UserModel.findOne({ clerk_Id: data.clerk_Id });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Remove clerk_Id from update data to avoid changing it
    const { clerk_Id, ...updateData } = data;
    
    // Log the update for debugging
    console.log("Updating user with clerk_Id:", clerk_Id);
    console.log("Update data:", updateData);
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
      { clerk_Id },
      { $set: updateData },
      { new: true } // Return the updated document
    );
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
