import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  let oldBalance = 0;
  try {
    const { email, amount } = await request.json();
    const client = await clientPromise;
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
      result = await users.insertOne({
        email,
        balance: newBalance,
        transactions: [
          {
            transactionType: amount > 0 ? "deposit" : "withdrawal",
            transactionAmount: Math.abs(amount),
            timestamp: new Date(),
          },
        ],
      });
    } else {
      result = await users.updateOne(
        { email },
        {
          $set: { balance: newBalance },
          $push: {
            transactions: {
              transactionType: amount > 0 ? "deposit" : "withdrawal",
              transactionAmount: Math.abs(amount),
              timestamp: new Date(),
            },
          },
        }
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
  }
}
