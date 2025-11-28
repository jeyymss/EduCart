"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TermsPrivacyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="underline hover:cursor-pointer">
          Terms & Privacy Policy
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto px-6 py-5 bg-white text-gray-800 text-sm leading-relaxed">
        <DialogHeader>
          <DialogTitle>EduCart Terms & Privacy Policy</DialogTitle>
        </DialogHeader>

        <div className="space-y-10">

        
          {/* TERMS OF SERVICE */}
          <section>
            <h1 className="font-bold text-xl mb-2">📘 Terms of Service</h1>
            <p className="text-sm text-slate-500 mb-4">
              <b>Effective Date:</b> October 7, 2025 — <b>Last Updated:</b> October 7, 2025
            </p>

            <div className="space-y-6">

              <div>
                <h2 className="font-bold text-base mb-1">1. Acceptance of Terms</h2>
                <p className="text-justify">
                  By accessing or using EduCart (“the Platform”), you agree to comply with these
                  Terms of Service (“Terms”). If you disagree with any part of these Terms, you
                  must not access or use the Platform. EduCart may revise these Terms from time
                  to time, and continued use implies acceptance of the revised version.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">2. Overview</h2>
                <p className="text-justify">
                  EduCart is a university-based marketplace platform that allows verified members
                  of academic institutions—including students, faculty, alumni, organizations,
                  and recognized student businesses—to buy, sell, rent, trade, give away, or
                  request items and services within a verified educational ecosystem.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">3. Eligibility</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Users must have a valid university-affiliated email address or be verified as alumni or a recognized business/organization.</li>
                  <li>False representation or impersonation is strictly prohibited.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">
                  4. Account Registration and Verification
                </h2>

                <p className="text-justify mb-3">
                  EduCart uses a tiered verification process to maintain trust within its university community.
                </p>

                <p className="font-semibold mb-1">a. Students and Faculty</p>
                <p className="text-justify mb-3">
                  Accounts are verified via official university email domains (e.g.,
                  <span className="font-mono bg-gray-100 px-1 rounded">@university.edu.ph</span>).
                </p>

                <p className="font-semibold mb-1">b. Organizations and Businesses</p>
                <p className="text-justify mb-3">
                  Student organizations and faculty-owned businesses must undergo document and ID
                  verification to obtain a <b>Verified Badge</b>, which grants access to enhanced
                  posting limits and marketplace sections.
                </p>

                <p className="font-semibold mb-1">c. Alumni Honor System</p>
                <p className="text-justify mb-3">
                  Alumni verification follows an <b>Honor System</b> combining university email
                  authentication with an ethical declaration.
                </p>

                <p className="mb-2">By registering as an Alumni User, you agree that:</p>
                <ol className="list-decimal list-inside space-y-1 pl-4">
                  <li>You are a legitimate alumnus/alumna of your declared university.</li>
                  <li>You will uphold honesty and integrity in all platform interactions.</li>
                  <li>
                    You understand that false representation or misconduct will be logged under the{" "}
                    <b>EduCart Alumni Honor Registry</b> and may result in permanent suspension.
                  </li>
                  <li>
                    You consent that reports involving alumni may be reviewed internally by EduCart administrators.
                  </li>
                </ol>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">5. User Conduct</h2>
                <p className="mb-2">You agree to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Use EduCart only for lawful purposes.</li>
                  <li>Provide accurate and truthful item details.</li>
                  <li>Communicate respectfully with other users.</li>
                  <li>Complete transactions honestly.</li>
                  <li>Uphold the <b>EduCart Honor System</b>.</li>
                </ul>
                <p className="mt-4 mb-2">Prohibited activities include:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Selling prohibited items</li>
                  <li>Identity misrepresentation</li>
                  <li>Circumventing payment or reporting systems</li>
                  <li>Posting harmful or fraudulent content</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">6. Transactions and Payments</h2>
                <p className="text-justify mb-3">
                  EduCart supports <b>GCash (escrow)</b> and <b>Cash-on-Meetup</b> transactions.
                </p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>GCash payments are held in escrow until both parties confirm completion.</li>
                  <li>Commissions apply to GCash transactions (2%–10%).</li>
                  <li>Cash meetups occur at users’ discretion; EduCart is not liable.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">7. Posting Limits and Subscriptions</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Students/Faculty/Alumni: 3 free posts/month</li>
                  <li>Organizations/Businesses: 5 free posts/month</li>
                  <li>Extra posts can be purchased or earned through escrow bonuses.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">8. Dispute Resolution</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Cases involving students/faculty are forwarded to Student Affairs.</li>
                  <li>Cases involving alumni fall under the Alumni Honor Review System.</li>
                  <li>Evidence such as screenshots may be required.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">9. Content Ownership and Usage</h2>
                <p className="text-justify">
                  Users retain ownership of their uploaded content. By posting, you grant EduCart a
                  non-exclusive license to display and distribute your content as needed for platform operation.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">10. Suspension and Termination</h2>
                <p className="text-justify mb-2">EduCart may suspend or terminate accounts that:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Violate these Terms</li>
                  <li>Misrepresent identity/verification</li>
                  <li>Commit fraudulent or unethical conduct</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">11. Liability Disclaimer</h2>
                <p className="text-justify">
                  EduCart is an intermediary platform and is not liable for damages, disputes,
                  delivery issues, or cash meetups conducted outside its controlled systems.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">12. Indemnity</h2>
                <p className="text-justify">
                  Users agree to indemnify EduCart and affiliated universities from any claim,
                  loss, or liability arising from misuse or violation of these Terms.
                </p>
              </div>
            </div>
          </section>
    
          <hr className="border-gray-300" />

          {/* PRIVACY POLICY */}
          <section>
            <h1 className="font-bold text-xl mb-2">🔐 Privacy Policy</h1>
            <p className="text-sm text-slate-500 mb-4">
              <b>Effective Date:</b> October 7, 2025 — <b>Last Updated:</b> October 7, 2025
            </p>

            <div className="space-y-6">

              <div>
                <h2 className="font-bold text-base mb-1">1. Introduction</h2>
                <p className="text-justify">
                  EduCart values your privacy. This Privacy Policy explains how we collect, use,
                  store, and protect your information on the platform.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">2. Information We Collect</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><b>Personal Information:</b> Name, university email, contact number, user role.</li>
                  <li><b>Verification Data:</b> IDs, documents, email verification.</li>
                  <li><b>Transaction Data:</b> Listings, messages, courier tracking, payments.</li>
                  <li><b>Behavioral Data:</b> Login history, reports, safety logs.</li>
                  <li>
                    <b>Alumni Honor Data:</b> Records related to the integrity-based verification system.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">3. How We Use Your Data</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Verify university affiliation</li>
                  <li>Facilitate transactions and payments</li>
                  <li>Enable safe communication</li>
                  <li>Investigate reports and prevent fraud</li>
                  <li>Enforce the Alumni Honor System</li>
                  <li>Improve platform experience</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">
                  4. Alumni Honor System & Accountability
                </h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Alumni accounts rely on trust-based verification.</li>
                  <li>Misconduct is recorded under the Honor Registry.</li>
                  <li>Data is private and reviewed only by EduCart admins.</li>
                  <li>Audit-related data may be retained after account deletion.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">5. Data Sharing and Disclosure</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Student Affairs Offices</li>
                  <li>GCash/payment processors</li>
                  <li>Courier partners</li>
                  <li>EduCart administrators</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">6. Data Retention</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Data is retained only as long as necessary</li>
                  <li>Honor Registry data may be retained for accountability</li>
                  <li>Users may request deletion or anonymization</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">7. User Rights</h2>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Access and correct data</li>
                  <li>Withdraw consent</li>
                  <li>Request deletion</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">8. Cookies and Analytics</h2>
                <p className="text-justify">
                  EduCart may use cookies to enhance performance and store preferences.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">9. External Links</h2>
                <p className="text-justify">
                  External couriers and payment processors have independent policies.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-base mb-1">10. Policy Updates</h2>
                <p className="text-justify">
                  EduCart may update this Privacy Policy. Continued use implies acceptance.
                </p>
              </div>

            </div>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
}
