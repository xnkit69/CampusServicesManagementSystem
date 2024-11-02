"use client";

import { useSession, signOut } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Script from "next/script";
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
  Landmark,
} from "lucide-react";
import { TopBar } from "@/components/ui/topbar";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState(10);
  const [walletBalance, setWalletBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/");
    }
  }, [session.status, router]);

  const fetchWalletBalance = useCallback(async () => {
    if (session.status !== "authenticated" || !session.data?.user?.email)
      return;

    try {
      const response = await fetch(`/api/users/balance/getBalance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.data.user.email }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch wallet balance");
      }
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch wallet balance. Please try again.",
      });
    }
  }, [session.status, session.data?.user?.email, toast]);

  const fetchTransactions = useCallback(async () => {
    if (session.status !== "authenticated" || !session.data?.user?.email)
      return;

    try {
      const response = await fetch(`/api/users/balance/getTransactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.data.user.email }),
      });

      const result = await response.json();
      if (result.success) {
        setTransactions(result.data.transactions.reverse() || []);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch transaction history.",
      });
    }
  }, [session.status, session.data?.user?.email, toast]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchWalletBalance();
      await fetchTransactions();
      setIsLoadingTransactions(false);
    };
    fetchData();
  }, [fetchWalletBalance, fetchTransactions]);

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

  const createOrderId = async () => {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(fundAmount * 100),
          currency: "INR",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create order. Please try again.",
      });
      throw error;
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    setIsAddFundsDialogOpen(false);

    try {
      const orderId = await createOrderId();
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: parseFloat(fundAmount.toString()) * 100,
        currency: "INR",
        name: session.data.user.name || "",
        description: "Add funds to wallet",
        order_id: orderId,
        handler: async function (response) {
          const data = {
            orderCreationId: orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await fetch("/api/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          const res = await result.json();
          if (res.isOk) {
            const updateBalanceRes = await fetch(
              "/api/users/balance/updateBalance",
              {
                method: "POST",
                body: JSON.stringify({
                  email: session.data.user.email,
                  amount: fundAmount,
                }),
              }
            );

            if (updateBalanceRes.ok) {
              setWalletBalance(
                (prevBalance) =>
                  (prevBalance || 0) + parseFloat(fundAmount.toString())
              );
              // Fetch updated transactions after successful payment
              await fetchTransactions();
            } else {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update balance",
              });
            }
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: res.message,
            });
          }
        },
        prefill: {
          name: session.data.user.name,
          email: session.data.user.email,
        },
        theme: {
          color: "#1a1a1a",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment processing error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description:
          "There was a problem processing your payment. Please try again.",
      });
    }

    setFundAmount(10); // reset fund amount
  };

  const handleLogout = () => {
    setIsLogoutDialogOpen(false);
    toast({
      variant: "destructive",
      title: "Logging Out!",
      description: "Redirecting to login page...",
    });
    signOut();
  };

  const adjustFundAmount = (amount) => {
    setFundAmount((prev) => Math.max(0, prev + amount));
  };

  function formatDateTime(timestamp) {
    const date = new Date(timestamp);

    // Add leading zeros to single digits
    const padZero = (num) => num.toString().padStart(2, "0");

    return {
      date: `${padZero(date.getDate())}/${padZero(
        date.getMonth() + 1
      )}/${date.getFullYear()}`,
      time: `${padZero(date.getHours())}:${padZero(
        date.getMinutes()
      )}:${padZero(date.getSeconds())}`,
      year: date.getFullYear(),
    };
  }

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

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
                        src={session.data.user.image || undefined}
                        alt={session.data.user.name || "User"}
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
                    <Landmark className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    {walletBalance !== null ? (
                      <p className="text-4xl font-bold">
                        ₹{walletBalance.toFixed(2)}
                      </p>
                    ) : (
                      <Skeleton className="h-10 w-32" />
                    )}
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
                      <Plus className="h-4  w-4" />
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button onClick={processPayment}>Confirm</Button>
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
            {isLoadingTransactions ? (
              <Skeleton className="h-32" />
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.transactionType === "deposit"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.transactionType === "deposit" ? (
                          <Plus className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.transactionType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.timestamp
                            ? formatDistanceToNow(
                                new Date(transaction.timestamp.toString()),
                                {
                                  addSuffix: true,
                                }
                              )
                            : "Date unknown"}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <p
                      className={`font-medium ${
                        transaction.transactionType === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.transactionType === "deposit" ? "+" : "-"}₹
                      {transaction.transactionAmount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent activity to display.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
