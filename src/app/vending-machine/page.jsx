"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { TopBar } from "@/components/ui/topbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDownCircleIcon,
  ChevronUpCircleIcon,
  Coffee,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

const items = [
  { id: 1, name: "Coffee", price: 15, icon: Coffee },
  { id: 2, name: "Tea", price: 10, icon: Coffee },
  { id: 3, name: "Latte", price: 25, icon: Coffee },
  { id: 4, name: "Espresso", price: 20, icon: Coffee },
  { id: 5, name: "Hot Chocolate", price: 30, icon: Coffee },
  { id: 6, name: "Green Tea", price: 15, icon: Coffee },
];

export default function VendingMachinePage() {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [orders, setOrders] = useState([]); // You'll need to fetch this from your API
  const [isChecked, setIsChecked] = useState(false); // New state for checkbox
  const [isBalanceSummaryOpen, setIsBalanceSummaryOpen] = useState(false); // State for expandable balance summary

  const fetchWalletBalance = useCallback(async () => {
    if (session.status !== "authenticated" || !session.data?.user?.email)
      return;

    try {
      const response = await fetch(`/api/users/balance/getBalance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.data.user.email }),
      });

      if (!response.ok) throw new Error("Failed to fetch wallet balance");

      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch wallet balance",
      });
    }
  }, [session.status, session.data?.user?.email, toast]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/");
    }
    fetchWalletBalance();
  }, [session.status, router, fetchWalletBalance]);

  const totalCost = selectedItems.reduce((sum, itemId) => {
    const item = items.find((i) => i.id === itemId);
    return sum + (item?.price || 0);
  }, 0);

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  };

  const handlePurchase = async () => {
    if (totalCost > walletBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Please add funds to your wallet",
      });
      return;
    }

    try {
      const response = await fetch("/api/users/balance/updateBalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.data.user.email,
          amount: -totalCost,
        }),
      });

      if (!response.ok) throw new Error("Failed to process payment");

      toast({
        title: "Purchase Successful",
        description: `Your order will be ready shortly!`,
      });
      setIsConfirmDialogOpen(false);
      setSelectedItems([]);
      fetchWalletBalance();

      // #TODO: replace with API
      setOrders((current) => [
        {
          items: selectedItems.map(
            (itemId) => items.find((i) => i.id === itemId).name
          ),
          total: totalCost,
          status: "Processing",
        },
        ...current,
      ]);
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process purchase",
      });
    }
  };

  if (session.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session.data) return null;

  return (
    <>
      <TopBar session={session.data} title="Vending Machine" />
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-end mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Wallet className="h-4 w-4" />
                  <span className="font-medium">₹{walletBalance || 0}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available Balance</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleCheckboxChange(item.id)}
                  />
                  <CardTitle className="flex items-center">
                    <item.icon className="mr-2 h-6 w-6" />
                    {item.name}
                  </CardTitle>
                </div>
                <CardDescription>₹{item.price}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            disabled={selectedItems.length === 0}
            onClick={() => setIsConfirmDialogOpen(true)}
          >
            Confirm Selection
          </Button>
        </div>

        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="space-y-1.5">
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Review your selection and total cost
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {selectedItems.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return (
                  <div
                    key={itemId}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center font-medium text-base border-t pt-4">
                <span>Total Order Cost</span>
                <span>₹{totalCost}</span>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsBalanceSummaryOpen((prev) => !prev)}
              >
                {isBalanceSummaryOpen ? (
                  <ChevronUpCircleIcon />
                ) : (
                  <ChevronDownCircleIcon />
                )}
                Balance Summary
              </Button>
              {isBalanceSummaryOpen && (
                <div className="bg-muted/20 rounded-lg">
                  <div className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Current Balance</span>
                      <span>₹{walletBalance}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-destructive">
                      <span>Deduction</span>
                      <span>- ₹{totalCost}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600 font-medium border-t border-border/50 pt-2">
                      <span>New Balance</span>
                      <span>₹{walletBalance - totalCost}</span>
                    </div>
                  </div>
                </div>
              )}

              {totalCost > walletBalance && (
                <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
                  <div className="font-medium">Insufficient Balance</div>
                  <div className="mt-1">
                    You need ₹{totalCost - walletBalance} more to complete this
                    purchase
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Checkbox
                  id="confirm-deduction"
                  checked={isChecked}
                  onCheckedChange={setIsChecked}
                />
                <Label
                  htmlFor="confirm-deduction"
                  className="ml-2 flex items-center text-red-500"
                >
                  I agree that this will deduct ₹{totalCost} from my account.
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={totalCost > walletBalance || !isChecked}
                onClick={handlePurchase}
              >
                Confirm Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {orders.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Recent Orders</span>
              </CardTitle>
              <CardDescription>Your order history</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{order.items.join(", ")}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {order.status}
                      </p>
                    </div>
                    <p className="font-medium">₹{order.total}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
