import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/express'
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    format: string;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
        !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET
    ) {
        return NextResponse.json({ error: 'Cloudinary configuration is missing' }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'resumes',
                        resource_type: 'auto',
                        use_filename: true,
                        unique_filename: true,
                        format: 'pdf',
                        type: 'upload', 
                        access_mode: 'public'
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result as CloudinaryUploadResult);
                        }
                    }
                )
                uploadStream.end(buffer);
            }
        );
        const pdfUrl = result.secure_url;
        const jpegUrl = pdfUrl.replace(".pdf", ".jpeg");
        
        const combinedUrl = `${jpegUrl}`;
        
        console.log(combinedUrl)
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
              resume_url : combinedUrl,
            },
          })

        return NextResponse.json({
            publicId: result.public_id,
            url: combinedUrl,
            success: true
        }, { status: 200 });
    } catch (error) {
        console.error('Error uploading resume:', error);
        return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
    }
}
