import OrgSignUpForm from "./component/org-signup";
import HeaderLogin from "@/components/auth/header";

export default function OrganizationPage() {
  return (
    <>
      <HeaderLogin />
      <OrgSignUpForm />
    </>
  );
}