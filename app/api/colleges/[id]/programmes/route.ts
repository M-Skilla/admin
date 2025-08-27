import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Programme } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Fetching programmes for college ID: ${id}`);

    // First check if the college exists
    const collegeDoc = await db.collection("colleges").doc(id).get();
    if (!collegeDoc.exists) {
      console.log(`College ${id} does not exist`);
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const snapshot = await db
      .collection("colleges")
      .doc(id)
      .collection("programmes")
      .get();

    console.log(`Found ${snapshot.docs.length} programmes for college ${id}`);

    const programmes = snapshot.docs.map((doc) => ({
      id: doc.id,
      collegeId: id,
      ...doc.data(),
    })) as (Programme & { id: string; collegeId: string })[];

    // Sort by name on the client side to avoid issues with empty collections
    programmes.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return NextResponse.json(programmes);
  } catch (error) {
    console.error("Error fetching programmes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch programmes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const programme: Programme = {
      abbrv: data.abbrv || "",
      name: data.name,
      years: data.years ? parseInt(data.years) : 0,
      duration: data.duration || "",
      description: data.description || "",
    };

    const docRef = await db
      .collection("colleges")
      .doc(id)
      .collection("programmes")
      .add(programme);

    return NextResponse.json({
      id: docRef.id,
      message: "Programme created successfully",
    });
  } catch (error) {
    console.error("Error creating programme:", error);
    return NextResponse.json(
      { error: "Failed to create programme" },
      { status: 500 }
    );
  }
}
