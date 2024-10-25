import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

// Check if MONGO_URI is defined
if (!uri) {
  console.error("MONGO_URI is not defined in the environment variables");
}

export async function POST(request) {
  let client;
  try {
    if (!uri) {
      return NextResponse.json(
        { error: "Database connection string is not configured" },
        { status: 500 }
      );
    }

    // Validate the MongoDB connection string
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      return NextResponse.json(
        { error: "Invalid MongoDB connection string" },
        { status: 500 }
      );
    }

    // Parse the request body
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    client = new MongoClient(uri);
    await client.connect();
    const database = client.db("CampusServicesManagementSystem");
    const users = database.collection("users");

    // Find the user by email
    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json({ balance: 0 }, { status: 200 });
    }

    const balance = user.balance || 0;

    return NextResponse.json({ balance }, { status: 200 });
  } catch (error) {
    console.error("Error getting balance:", error);
    return NextResponse.json(
      { error: "Failed to get balance", details: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
