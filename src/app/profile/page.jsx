"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Mail } from "lucide-react";
import { TopBar } from "@/components/ui/topbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// interface ProfilePageProps {
//   session: {
//     user: {
//       name: string
//       email: string
//       image: string
//     }
//   }
//   walletBalance: number
// }

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return router.push("/");
  }

  const walletBalance = 0; // #TODO: Replace with actual wallet balance
  return (
    <>
      <TopBar session={session} title={"Profile"} />

      <div className="container mx-auto py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name}
                  />
                  <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">
                    {session.user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Google Account
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{session.user.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet Balance</CardTitle>
              <CardDescription>Your current account balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <CreditCard className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-3xl font-bold">
                    ${walletBalance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available balance
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add Funds</Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest transactions and service usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* #TODO: Placeholder for recent activity to replace this with actual data later */}
            <p className="text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
