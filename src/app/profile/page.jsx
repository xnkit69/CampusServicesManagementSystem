"use client";

import { useSession, signOut } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Mail,
  LogOut,
  IndianRupee,
  User,
  Clock,
  Plus,
  Minus,
} from "lucide-react";
import { TopBar } from "@/components/ui/topbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState(10);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/");
    }
  }, [session.status, router]);

  if (session.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session.status !== "authenticated") {
    return null;
  }

  const walletBalance = 0; // #TODO: Replace with actual wallet balance

  const handleLogout = () => {
    setIsLogoutDialogOpen(false);
    toast({
      variant: "destructive",
      title: "Logging Out!",
      description: "Redirecting to login page...",
    });
    signOut();
  };

  const handleAddFunds = () => {
    // TODO: Implement the actual fund addition logic here
    setIsAddFundsDialogOpen(false);
    toast({
      title: "Funds Added",
      description: `₹${fundAmount} has been added to your wallet.`,
    });
  };

  const adjustFundAmount = (amount) => {
    setFundAmount((prev) => Math.max(0, prev + amount));
  };

  return (
    <>
      <TopBar session={session.data} title={"Profile"} />

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Profile Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-6 w-6" />
                <span>Your Personal Profile</span>
              </CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={session.data.user.image}
                        alt={session.data.user.name}
                      />
                      <AvatarFallback>
                        {session.data.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {session.data.user.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Google Account
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{session.data.user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog
                open={isLogoutDialogOpen}
                onOpenChange={setIsLogoutDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to log out?</DialogTitle>
                    <DialogDescription>
                      You will be redirected to the login page.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsLogoutDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      Log out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Wallet Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6" />
                <span>Your Wallet</span>
              </CardTitle>
              <CardDescription>
                Manage your funds and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <IndianRupee className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold">
                      ₹{walletBalance.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available balance
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Last transaction
                    </span>
                    <span className="text-sm text-muted-foreground">N/A</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-sm text-muted-foreground">₹0.00</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog
                open={isAddFundsDialogOpen}
                onOpenChange={setIsAddFundsDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <IndianRupee className="mr-2 h-4 w-4" /> Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Funds to Your Wallet</DialogTitle>
                    <DialogDescription>
                      Select the amount you want to add to your wallet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-center space-x-4 py-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustFundAmount(-5)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-4xl font-bold">₹{fundAmount}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustFundAmount(5)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddFunds}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Activity Log Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6" />
              <span>Recent Activity Log</span>
            </CardTitle>
            <CardDescription>
              Track your latest transactions and service usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
