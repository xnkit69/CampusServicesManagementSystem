"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/"); // Redirect to home if not signed in
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    );
  }

  if (!session) {
    return null; // Prevents rendering before redirection occurs
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Welcome, {session.user.name}</h1>
      <button
        onClick={() => router.push("/printer")}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2"
      >
        Printer
      </button>
      <button
        onClick={() => router.push("/x")}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        X
      </button>
      <button
        onClick={() => signOut()}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Sign out
      </button>
    </div>
  );
}
