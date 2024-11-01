import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();

    const client = await clientPromise;
    const db = client.db("CampusServicesManagementSystem");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions: user.transactions || [],
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to retrieve transactions",
      data: null,
    });
  }
}
