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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDownCircle,
  ChevronUpCircle,
  Drumstick,
  Fish,
  Ham,
  HandPlatter,
  Pizza,
  ShoppingCart,
  Utensils,
  Vegan,
  Wallet,
  Plus,
  Minus,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const items = [
  { id: 1, name: "Parotta", price: 15, icon: Pizza },
  { id: 2, name: "Biriyani", price: 10, icon: HandPlatter },
  { id: 3, name: "Chapatti", price: 25, icon: Utensils },
  { id: 4, name: "Chicken Curry", price: 20, icon: Drumstick },
  { id: 5, name: "Beef Curry", price: 30, icon: Ham },
  { id: 6, name: "Fish Curry", price: 30, icon: Fish },
  { id: 7, name: "Veg Curry", price: 15, icon: Vegan },
  { id: 8, name: "Meals", price: 50, icon: HandPlatter },
];

export default function VendingMachinePage() {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState({});
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isBalanceSummaryOpen, setIsBalanceSummaryOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

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

  const totalCost = Object.entries(selectedItems).reduce(
    (sum, [id, quantity]) => {
      const item = items.find((i) => i.id === parseInt(id));
      return sum + (item?.price || 0) * quantity;
    },
    0
  );

  const handleQuantityChange = (itemId, change) => {
    setSelectedItems((prev) => {
      const newQuantity = (prev[itemId] || 0) + change;
      if (newQuantity <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });
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
      setSelectedItems({});
      setIsConfirmed(false);
      fetchWalletBalance();

      setOrders((current) => [
        {
          items: Object.entries(selectedItems).map(([id, quantity]) => {
            const item = items.find((i) => i.id === parseInt(id));
            return `${item.name} x${quantity}`;
          }),
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
      <div className="container mx-auto py-6 px-4 pb-24">
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
        <div className="container mx-auto py-6 px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <item.icon className="mr-2 h-6 w-6 text-primary" />
                      {item.name}
                    </CardTitle>
                    <CardDescription className="text-lg font-bold text-primary">
                      ₹{item.price}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-foreground hover:bg-primary"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={!selectedItems[item.id]}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium w-12 text-center">
                      {selectedItems[item.id] || 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-foreground hover:bg-primary"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedItems[item.id] > 0 && (
                    <div className="mt-2 text-right text-sm font-medium text-muted-foreground">
                      Subtotal: ₹{item.price * selectedItems[item.id]}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={(open) => {
            setIsConfirmDialogOpen(open);
            setIsConfirmed(false);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="space-y-1.5">
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Review your selection and total cost
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {Object.entries(selectedItems).map(([itemId, quantity]) => {
                const item = items.find((i) => i.id === parseInt(itemId));
                return (
                  <div
                    key={itemId}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>
                      {item.name} x{quantity}
                    </span>
                    <span>₹{item.price * quantity}</span>
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
                  <ChevronUpCircle />
                ) : (
                  <ChevronDownCircle />
                )}
                Order Summary
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-purchase"
                  checked={isConfirmed}
                  onCheckedChange={setIsConfirmed}
                />
                <label
                  htmlFor="confirm-purchase"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that this will deduct ₹{totalCost} from my account.
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setIsConfirmed(false);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={totalCost > walletBalance || !isConfirmed}
                onClick={handlePurchase}
              >
                Confirm Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Bottom Bar Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              className="text-primary hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {Object.values(selectedItems).reduce((a, b) => a + b, 0)} items
            </Button>
            <div className="flex items-center">
              <span className="font-semibold mr-4 text-lg">
                Total: ₹{totalCost}
              </span>
              <Button
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={Object.keys(selectedItems).length === 0}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
        {isCartOpen && (
          <div className="container mx-auto px-4 py-4 bg-background border-t border-primary/20">
            <ScrollArea className="h-48">
              {Object.entries(selectedItems).map(([itemId, quantity]) => {
                const item = items.find((i) => i.id === parseInt(itemId));
                return (
                  <div
                    key={itemId}
                    className="flex items-center justify-between py-2 border-b border-primary/10 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary-foreground hover:bg-primary"
                        onClick={() =>
                          handleQuantityChange(parseInt(itemId), -1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2 text-foreground">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary-foreground hover:bg-primary"
                        onClick={() =>
                          handleQuantityChange(parseInt(itemId), 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="ml-4 w-16 text-right text-foreground">
                        ₹{item.price * quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
            <Separator className="my-4 bg-primary/20" />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span className="text-foreground">Total</span>
              <span className="text-primary">₹{totalCost}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
