"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

function getInitials(name) {
  const words = name.split(" ").filter((word) => word.length > 0);

  if (words.length === 0) {
    return "";
  }

  if (words.length === 1) {
    // If there's only one word, return the first letter
    return words[0][0].toUpperCase();
  }

  // Return the first letter of the first word and the first letter of the last word
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const TopBar = (session) => {
  const { toast } = useToast();
  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-xl">CSMS</div>
      <div className="text-lg font-semibold">
        <b>Dashboard</b>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={session.session.user.image} />
            <AvatarFallback>
              {getInitials(session.session.user.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{session.session.user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>{" "}
          {/* TODO: Add profile page */}
          <DropdownMenuItem>Wallet</DropdownMenuItem>{" "}
          {/* TODO: Add wallet page */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              toast({
                variant: "destructive",
                title: "Logged Out!.",
                description: "Redirecting to login page...",
              });
              signOut();
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

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
    <div className="min-h-screen bg-gray-100">
      <TopBar session={session} />
      <main className="container mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to your Dashboard
          </h1>
          <h2 className="text-xl text-gray-600">Hello, {session.user.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push("/printer")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Printer Services
          </button>
          <button
            onClick={() => router.push("/x")}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Service X
          </button>
          {/* Add more service buttons here */}
        </div>
      </main>
    </div>
  );
}
