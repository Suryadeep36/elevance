// /app/api/user/[clerk_id]/route.ts

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const allUsers = await UserModel.find({});

    if (!allUsers) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const filteredUsers: any = [];
    allUsers.map((ele) => {
      filteredUsers.push({
        username: ele.name,
        metamaskAddress: ele.metamaskAddress,
      });
    });
    return NextResponse.json({ success: true, allUsers: filteredUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user" },
      { status: 500 }
    );
  }
}
