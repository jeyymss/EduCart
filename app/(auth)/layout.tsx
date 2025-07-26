import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <div>
        <Link href={"/"}>
          <Button>Back</Button>
        </Link>
      </div>

      {children}
    </main>
  );
}
