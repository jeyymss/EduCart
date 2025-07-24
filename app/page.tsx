import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      <h1 className="font-bold">Landing Page</h1>
      <div className="flex gap-5">
        <Link href={"/login"}>
          <Button>Login</Button>
        </Link>
        <Link href={"/register"}>
          <Button>Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}
