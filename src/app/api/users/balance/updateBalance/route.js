import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export async function POST(request) {
  let oldBalance = 0;
  try {
    const { email, amount } = await request.json();
    await client.connect();
    const database = client.db("CampusServicesManagementSystem");
    const users = database.collection("users");

    // Find the user by email
    const user = await users.findOne({ email });
    let newUser = false;

    if (!user) {
      newUser = true;
    } else {
      oldBalance = user.balance || 0;
    }

    const newBalance = oldBalance + amount;
    let result;
    // Update the user's balance
    if (newUser) {
      result = await users.insertOne({ email, balance: newBalance });
    } else {
      result = await users.updateOne(
        { email },
        { $set: { balance: newBalance } }
      );
    }

    if (result.modifiedCount === 1 || result.insertedId) {
      return NextResponse.json(
        { message: "Wallet balance updated", newBalance },
        { status: 200 }
      );
    } else {
      throw new Error("Failed to update balance");
    }
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json(
      { error: "Failed to update balance" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
