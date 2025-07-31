import AuthFeatureCard from "@/components/auth/authDesign";
import HeaderLogin from "@/components/auth/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderLogin />
      <main className="flex">
        <div className="w-full md:w-[45%]">{children}</div>
        <AuthFeatureCard />
      </main>
    </>
  );
}
