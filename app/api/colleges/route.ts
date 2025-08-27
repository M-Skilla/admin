import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { College } from "@/lib/types";

export async function GET() {
  try {
    const snapshot = await db
      .collection("colleges")
      .orderBy("name", "asc")
      .get();

    const colleges = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(colleges);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const college: Omit<College, "id"> = {
      abbrv: data.abbrv,
      name: data.name,
    };

    const docRef = await db.collection("colleges").add(college);

    return NextResponse.json({
      id: docRef.id,
      message: "College created successfully",
    });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json(
      { error: "Failed to create college" },
      { status: 500 }
    );
  }
}
