import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        throw new Error(`File ${file.name} is not an image`);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `announcements/${timestamp}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      console.log("Storage Bucket:", process.env.FIREBASE_STORAGE_BUCKET);

      // Upload to Firebase Storage - explicitly specify bucket name
      let bucketName = process.env.FIREBASE_STORAGE_BUCKET;
      if (!bucketName) {
        throw new Error("Firebase Storage bucket name not configured");
      }

      // Remove gs:// prefix if present
      bucketName = bucketName.replace(/^gs:\/\//, "");

      const bucket = storage.bucket(bucketName);
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // Make the file publicly accessible
      await fileUpload.makePublic();

      // Return the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      return publicUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);

    return NextResponse.json({ imageUrls }, { status: 200 });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}
