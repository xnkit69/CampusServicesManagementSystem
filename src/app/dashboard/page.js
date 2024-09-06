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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrinterIcon, SettingsIcon } from "lucide-react";

function getInitials(name) {
  const words = name.split(" ").filter((word) => word.length > 0);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const TopBar = ({ session }) => {
  const { toast } = useToast();
  return (
    <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <div className="font-bold text-xl">CSMS</div>
      <div className="text-lg font-semibold">Services</div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={session.user.image} />
            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Wallet</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              toast({
                variant: "destructive",
                title: "Logged Out!",
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

export default function ServiceSelection() {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar session={session} />
      <main className="container mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Choose a Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-muted-foreground">
              Select from our available services below
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PrinterIcon className="mr-2 h-6 w-6" />
                Printer Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Manage your printing needs with our comprehensive printer
                services.
              </p>
              <ul className="list-disc list-inside mb-4 text-sm text-muted-foreground">
                <li>Print document management</li>
                <li>Printer maintenance and support</li>
                <li>Ink and toner supply management</li>
              </ul>
              <Button
                onClick={() => router.push("/printer")}
                className="w-full"
                variant="default"
              >
                Access Printer Services
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="mr-2 h-6 w-6" />
                Service X
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Explore our innovative Service X for advanced solutions.
              </p>
              <ul className="list-disc list-inside mb-4 text-sm text-muted-foreground">
                <li>Feature 1 of Service X</li>
                <li>Feature 2 of Service X</li>
                <li>Feature 3 of Service X</li>
              </ul>
              <Button
                onClick={() => router.push("/x")}
                className="w-full"
                variant="default"
              >
                Access Service X
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
