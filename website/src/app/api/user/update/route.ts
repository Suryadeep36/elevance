import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function PUT(req: Request) {
  try {
    await dbConnect();
    
    const data = await req.json();
    console.log("data is ", data);
    
    if (!data.clerk_Id) {
      return NextResponse.json({ error: 'Clerk ID is required' }, { status: 400 });
    }
    
    // Find the user first
    const user = await UserModel.findOne({ clerk_Id: data.clerk_Id });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { clerk_Id, certificates, ...updateData } = data;

    // Prepare update operations
    const updateOps: Record<string, any> = {};

    // 1. Handle general updates (non-array fields)
    if (Object.keys(updateData).length > 0) {
      updateOps.$set = updateData;
    }

    // 2. Handle certificates (append new ones instead of replacing)
    if (certificates && Array.isArray(certificates)) {
      const newCertificates = certificates.map((cert: any) =>
        typeof cert === 'object' ? cert.data?.url || cert.data : cert
      );

      updateOps.$push = {
        certificates: {
          $each: newCertificates, // Add all new certificates
        },
      };
    }

    console.log("Update Operations:", updateOps);

    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
      { clerk_Id },
      updateOps, // Apply all operations
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}