"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomeContent() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && status === "authenticated") {
      router.push("/dashboard"); // Adjusted navigation for App Router
    }
  }, [isMounted, status, router]);

  if (!isMounted || status === "loading") {
    return (
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    );
  }

  if (session) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign in with Google
    </button>
  );
}
