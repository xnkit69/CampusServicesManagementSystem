"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PrinterIcon,
  FileTextIcon,
  CoffeeIcon,
  Printer,
  CarIcon,
  IdCardIcon,
  BeakerIcon,
  BookText,
} from "lucide-react";
import { TopBar } from "@/components/ui/topbar";

export default function Component() {
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

  const sections = [
    {
      title: "Printer Automation",
      cards: [
        {
          title: "Printer",
          icon: PrinterIcon,
          route: "/printer",
          description: "Access and manage printer settings and queue",
        },
      ],
    },
    {
      title: "College Slips",
      cards: [
        {
          title: "Pink Slip",
          icon: FileTextIcon,
          route: "/pink-slip",
          description: "Generate and manage pink slips for various purposes",
        },
        {
          title: "Gate Pass",
          icon: FileTextIcon,
          route: "/gate-pass",
          description: "Create and view gate passes for entry/exit",
        },
        {
          title: "3D Printing",
          icon: Printer,
          route: "/3d-printing",
          description: "Submit and track 3D printing requests",
        },
        {
          title: "Vehicle Pass",
          icon: CarIcon,
          route: "/vehicle-pass",
          description: "Apply for and manage vehicle parking passes",
        },
        {
          title: "Lost ID Card",
          icon: IdCardIcon,
          route: "/lost-id-card",
          description: "Report lost ID cards and request replacements",
        },
        {
          title: "Lab Permission",
          icon: BeakerIcon,
          route: "/lab-permission",
          description: "Request and view lab access permissions",
        },
        {
          title: "Leave Form",
          icon: BookText,
          route: "/leave-form",
          description: "Leave Form for students",
        },
      ],
    },
    {
      title: "Vending Machine",
      cards: [
        {
          title: "Buy",
          icon: CoffeeIcon,
          route: "/vending-machine",
          description: "Purchase items from the vending machine",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar session={session} title="Dashboard" />
      <main className="container mx-auto p-6">
        {sections.map((section, index) => (
          <div key={index} className="mb-12 bg-secondary rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.cards.map((card, cardIndex) => (
                <Card
                  key={cardIndex}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <card.icon className="mr-2 h-6 w-6" />
                      {card.title}
                    </CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => router.push(card.route)}
                      className="w-full"
                      variant="default"
                    >
                      Access {card.title}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
