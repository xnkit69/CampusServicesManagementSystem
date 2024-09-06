"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TopBar } from "@/components/ui/topbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// type PrintStatus = 'processing' | 'printing' | 'done'

// interface PrintJob {
//   id: number
//   name: string
//   status: PrintStatus
// }

export default function PrinterServicesPage() {
  const [queueCount, setQueueCount] = useState(3);
  const [printJobs, setPrintJobs] = useState([
    { id: 1, name: "Document 1", status: "processing" },
    { id: 2, name: "Document 2", status: "printing" },
    { id: 3, name: "Document 3", status: "done" },
  ]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
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

  const handleCancelPrint = (id) => {
    setPrintJobs(printJobs.filter((job) => job.id !== id));
    setQueueCount(queueCount - 1);
  };

  const handleNewPrint = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newJob = {
      id: printJobs.length + 1,
      name: formData.get("processName"),
      status: "processing",
    };
    setPrintJobs([...printJobs, newJob]);
    setQueueCount(queueCount + 1);
  };

  const PrintForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="processName" className="text-right">
            Process Name
          </Label>
          <Input id="processName" name="processName" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="copies" className="text-right">
            Copies
          </Label>
          <Input
            id="copies"
            name="copies"
            type="number"
            min="1"
            defaultValue="1"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Sides</Label>
          <RadioGroup defaultValue="single" className="col-span-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single">Single</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="double" id="double" />
              <Label htmlFor="double">Double</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Color</Label>
          <RadioGroup defaultValue="bw" className="col-span-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bw" id="bw" />
              <Label htmlFor="bw">Black & White</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="color" id="color" />
              <Label htmlFor="color">Color</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="document" className="text-right">
            Document
          </Label>
          <Input
            id="document"
            name="document"
            type="file"
            className="col-span-3"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-6 pb-6">
        <Button type="submit" className="w-full">
          Submit
        </Button>
        {isDesktop ? (
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("close-dialog")?.click()}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );

  const QueueContent = () => (
    <ScrollArea className="h-[400px]">
      {printJobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between p-4 border-b"
        >
          <div>
            <h3 className="font-semibold">{job.name}</h3>
            <Badge variant={job.status === "done" ? "default" : "secondary"}>
              {job.status}
            </Badge>
          </div>
          <Button
            variant="destructive"
            disabled={job.status !== "processing"}
            onClick={() => handleCancelPrint(job.id)}
          >
            Cancel
          </Button>
        </div>
      ))}
    </ScrollArea>
  );

  return (
    <>
      <TopBar session={session} title={"Printer Services"} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Printer Services</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>New Print Job</CardTitle>
              <CardDescription>Start a new print job</CardDescription>
            </CardHeader>
            <CardContent>
              {isDesktop ? (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button>New Print</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>New Print Job</DrawerTitle>
                      <DrawerDescription>
                        Fill in the details for your new print job
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                      <PrintForm onSubmit={handleNewPrint} />
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>New Print</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Print Job</DialogTitle>
                      <DialogDescription>
                        Fill in the details for your new print job
                      </DialogDescription>
                    </DialogHeader>
                    <PrintForm onSubmit={handleNewPrint} />
                    <DialogFooter className="sr-only">
                      <Button id="close-dialog">Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Current Queue</CardTitle>
              <CardDescription>Documents waiting to be printed</CardDescription>
            </CardHeader>
            <CardContent>
              {isDesktop ? (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button>View Queue ({queueCount})</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Print Queue</DrawerTitle>
                      <DrawerDescription>Current print jobs</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                      <QueueContent />
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline" className="w-full">
                          Close
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>View Queue ({queueCount})</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Print Queue</DialogTitle>
                      <DialogDescription>Current print jobs</DialogDescription>
                    </DialogHeader>
                    <QueueContent />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          document.getElementById("close-queue-dialog")?.click()
                        }
                      >
                        Close
                      </Button>
                    </DialogFooter>
                    <div className="sr-only">
                      <Button id="close-queue-dialog">Close</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
