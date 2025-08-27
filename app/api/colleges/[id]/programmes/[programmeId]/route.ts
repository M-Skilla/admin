import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; programmeId: string } }
) {
  try {
    await db
      .collection("colleges")
      .doc(params.id)
      .collection("programmes")
      .doc(params.programmeId)
      .delete();

    return NextResponse.json({ message: "Programme deleted successfully" });
  } catch (error) {
    console.error("Error deleting programme:", error);
    return NextResponse.json(
      { error: "Failed to delete programme" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; programmeId: string } }
) {
  try {
    const data = await request.json();

    const updateData = {
      abbrv: data.abbrv || "",
      name: data.name,
      years: data.years ? parseInt(data.years) : 0,
      duration: data.duration || "",
      description: data.description || "",
    };

    await db
      .collection("colleges")
      .doc(params.id)
      .collection("programmes")
      .doc(params.programmeId)
      .update(updateData);

    return NextResponse.json({ message: "Programme updated successfully" });
  } catch (error) {
    console.error("Error updating programme:", error);
    return NextResponse.json(
      { error: "Failed to update programme" },
      { status: 500 }
    );
  }
}
