import { NextRequest, NextResponse } from "next/server";
import { db as adminDb, auth } from "@/lib/firebase-admin";
import type { User } from "@/lib/types";

export async function GET() {
  try {
    const usersSnapshot = await adminDb
      .collection("users")
      .orderBy("fullName", "asc")
      .get();

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.fullName,
        college: data.college,
        programme: data.programme,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Get college information
    const collegeDoc = await adminDb
      .collection("colleges")
      .doc(data.collegeId)
      .get();
    if (!collegeDoc.exists) {
      return NextResponse.json({ error: "College not found" }, { status: 400 });
    }
    const collegeData = collegeDoc.data();

    // Get programme information if specified
    let programmeData = null;
    if (data.programmeId) {
      const programmeDoc = await adminDb
        .collection("colleges")
        .doc(data.collegeId)
        .collection("programmes")
        .doc(data.programmeId)
        .get();

      if (programmeDoc.exists) {
        programmeData = programmeDoc.data();
      }
    }

    // Create authentication user
    const email = `${data.regNo}@college.edu`;
    const password = "campus";

    let authUserId: string;
    try {
      const authUser = await auth.createUser({
        email: email,
        password: password,
        displayName: data.fullName,
        emailVerified: true, // Since this is admin-created, we can mark as verified
      });
      authUserId = authUser.uid;
      console.log(
        `Created auth user with email: ${email} and UID: ${authUserId}`
      );
    } catch (authError) {
      console.error("Error creating authentication user:", authError);
      return NextResponse.json(
        { error: "Failed to create authentication user" },
        { status: 500 }
      );
    }

    const user: Omit<User, "id"> = {
      college: {
        id: data.collegeId,
        abbrv: collegeData?.abbrv || "",
        name: collegeData?.name || "",
      },
      programme: programmeData
        ? {
            abbrv: programmeData.abbrv,
            name: programmeData.name,
            years: programmeData.years,
          }
        : {
            abbrv: "",
            name: "",
            years: 0,
          },
      endDate: new Date(data.endDate),
      fullName: data.fullName,
      regNo: data.regNo,
      roles: data.roles
        ? data.roles.split(",").map((role: string) => role.trim())
        : [],
      startDate: new Date(data.startDate),
      profilePicUrl: data.profilePicUrl || "",
    };

    // Store the user document with the same ID as the auth user
    try {
      await adminDb.collection("users").doc(authUserId).set(user);
    } catch (firestoreError) {
      // If Firestore creation fails, delete the auth user to maintain consistency
      try {
        await auth.deleteUser(authUserId);
      } catch (deleteError) {
        console.error(
          "Error deleting auth user after Firestore failure:",
          deleteError
        );
      }
      throw firestoreError;
    }

    return NextResponse.json({
      id: authUserId,
      message: "User and authentication account created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
