import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.collection("announcement").doc(params.id).delete();
    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const updateData = {
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
      department: data.department,
      title: data.title,
      visibility: data.visibility
        ? data.visibility.split(",").map((v: string) => v.trim())
        : [],
      imageUrls: data.imageUrls || [],
    };

    await db.collection("announcement").doc(params.id).update(updateData);

    return NextResponse.json({ message: "Announcement updated successfully" });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}
