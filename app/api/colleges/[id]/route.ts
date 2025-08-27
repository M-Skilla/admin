import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Also delete all programmes in this college
    const programmesSnapshot = await db
      .collection("colleges")
      .doc(params.id)
      .collection("programmes")
      .get();

    const batch = db.batch();
    programmesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the college
    batch.delete(db.collection("colleges").doc(params.id));

    await batch.commit();

    return NextResponse.json({ message: "College deleted successfully" });
  } catch (error) {
    console.error("Error deleting college:", error);
    return NextResponse.json(
      { error: "Failed to delete college" },
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
      abbrv: data.abbrv,
      name: data.name,
    };

    await db.collection("colleges").doc(params.id).update(updateData);

    return NextResponse.json({ message: "College updated successfully" });
  } catch (error) {
    console.error("Error updating college:", error);
    return NextResponse.json(
      { error: "Failed to update college" },
      { status: 500 }
    );
  }
}
