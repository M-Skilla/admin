import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Announcement } from "@/lib/types";

export async function GET() {
  try {
    const snapshot = await db
      .collection("announcement")
      .orderBy("createdAt", "desc")
      .get();
    const announcements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }));

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const announcement: Omit<Announcement, "id"> = {
      author: {
        college: {
          abbrv: data.collegeAbbrv,
          id: data.collegeId,
          name: data.collegeName,
        },
        id: data.authorId,
        name: data.authorName,
        roles: data.roles
          ? data.roles.split(",").map((role: string) => role.trim())
          : [],
      },
      body: data.body,
      createdAt: new Date(),
      department: data.department,
      title: data.title,
      visibility: data.visibility
        ? data.visibility.split(",").map((v: string) => v.trim())
        : [],
      imageUrls: data.imageUrls || [],
    };

    const docRef = await db.collection("announcement").add(announcement);

    return NextResponse.json({
      id: docRef.id,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
