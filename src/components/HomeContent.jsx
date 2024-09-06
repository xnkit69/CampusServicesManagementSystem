"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      let timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000); // Redirect after 3 seconds

      // Simulate progress
      let interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <Card className="w-[350px]">
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (session) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome, {session.user.name}</CardTitle>
          <CardDescription>Redirecting to your dashboard...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Loading your personalized dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>Sign in to access campus services</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => signIn("google")} className="w-full">
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
