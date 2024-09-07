"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function getInitials(name) {
  const words = name.split(" ").filter((word) => word.length > 0);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export const TopBar = ({ session, title }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (pathname === "/profile") {
      router.push("/dashboard");
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="bg-primary text-primary-foreground px-4 py-3 flex justify-between items-center shadow-md">
      <Link href="/dashboard" className="flex items-center">
        <HomeIcon size={24} className="inline-block mr-2" />
        <span className="font-bold text-xl tracking-tight cursor-pointer">
          CSMS
        </span>
      </Link>
      <div className="text-lg font-semibold">{title}</div>
      <button onClick={handleProfileClick} className="focus:outline-none">
        <Avatar className="h-8 w-8 transition-transform hover:scale-110">
          <AvatarImage src={session.user.image} alt={session.user.name} />
          <AvatarFallback className="bg-primary-foreground text-primary">
            {getInitials(session.user.name)}
          </AvatarFallback>
        </Avatar>
      </button>
    </div>
  );
};
