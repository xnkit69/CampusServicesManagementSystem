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
import { signOut } from "next-auth/react";
import Link from "next/link";

function getInitials(name) {
  const words = name.split(" ").filter((word) => word.length > 0);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export const TopBar = ({ session, title }) => {
  const { toast } = useToast();

  return (
    <div className="bg-primary text-primary-foreground px-4 py-3 flex justify-between items-center shadow-md">
      <Link href="/dashboard" passHref>
        <span className="font-bold text-xl tracking-tight cursor-pointer">
          CSMS
        </span>
      </Link>
      <div className="text-lg font-semibold">{title}</div>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white rounded-full">
          <Avatar className="h-8 w-8 transition-transform hover:scale-110">
            <AvatarImage src={session.user.image} alt={session.user.name} />
            <AvatarFallback className="bg-primary-foreground text-primary">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Wallet</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive cursor-pointer"
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
