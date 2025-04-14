import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req: Request) {
    await dbConnect();
    const { clerk_Id, name, email, profileImage} = await req.json();

    try {
        const user = new UserModel({
            clerk_Id,
            name,
            email,
            profileImage
        });

        await user.save();
        return new Response(JSON.stringify(user), { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    try {
        const user = await UserModel.findOne({ clerk_Id: userId });
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch user" }), { status: 500 });
    }
}