import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Debug: Checking college ${id}`);

    // Check if college exists
    const collegeDoc = await db
      .collection("colleges")
      .doc(id)
      .get();
    const collegeExists = collegeDoc.exists;
    const collegeData = collegeDoc.data();

    // Get programmes
    const programmesSnapshot = await db
      .collection("colleges")
      .doc(id)
      .collection("programmes")
      .get();

    const programmes = programmesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      collegeId: id,
      collegeExists,
      collegeData,
      programmesCount: programmes.length,
      programmes,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
