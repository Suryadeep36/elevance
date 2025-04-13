// /app/api/user/[clerk_id]/route.ts

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { clerk_id: string } }
) {
  try {
    await dbConnect();
    const { clerk_id } = context.params;
    console.log("id is ", clerk_id , " and ")
    if (!clerk_id) {
      return NextResponse.json(
        { error: 'Invalid clerk ID parameter' },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ clerk_Id: clerk_id });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: 'Failed to retrieve user' },
      { status: 500 }
    );
  }
}
