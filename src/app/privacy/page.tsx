import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl sm:text-4xl font-black text-[#303654] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#8580A3] mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-sm text-[#4A4568] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account details: your name, email address, and phone number.</li>
              <li>Payment information: amount paid, payment plan, and a transaction reference — card and bank
                details themselves are handled directly by Paystack and never stored on our servers.</li>
              <li>Profile photo, if you choose to upload one.</li>
              <li>Learning activity: lessons completed, quiz attempts and scores, assignment submissions, live
                class attendance, and messages you send to our AI Tutor.</li>
              <li>Anonymous usage data: which pages you visit and which advertising banner or link brought you
                here, tied to a random identifier in your browser — not to your name, unless you later create an
                account from the same browser.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">2. How We Use It</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create and manage your enrollment, track your progress, and issue your certificate.</li>
              <li>To process payments and keep an accurate record of what you&apos;ve paid.</li>
              <li>To send you reminders about classes, payments, and your welcome session — by in-app
                notification and, where you&apos;ve provided a phone number, by WhatsApp.</li>
              <li>To measure which outreach (banners, QR codes, referrals) is actually bringing in students, so we
                can spend our marketing budget where it works.</li>
              <li>To credit referral rewards when a friend you referred enrolls and pays.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">3. Who We Share It With</h2>
            <p className="mb-2">We use a small number of trusted third-party services to run the platform:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Paystack</strong> — processes card, bank transfer, and USSD payments. We receive
                confirmation of payment, never your full card details.</li>
              <li><strong>Twilio</strong> — delivers WhatsApp messages (class reminders, welcome check-ins) to the
                phone number you provide.</li>
              <li><strong>Cloudinary</strong> — stores profile pictures you choose to upload.</li>
              <li><strong>Google (Gemini API)</strong> — powers the AI Tutor; messages you send it are processed
                to generate a response.</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information to anyone, for any reason.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">4. Cookies &amp; Local Storage</h2>
            <p>
              We use a single, secure session cookie to keep you signed in — it is cryptographically signed and
              cannot be read or altered by anyone but our server. Your browser also stores a random, anonymous
              identifier (not linked to your name) used only to avoid double-counting page visits in our marketing
              analytics.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">5. How Long We Keep Your Data</h2>
            <p>
              We keep your enrollment, payment, and certificate records for as long as your account exists, since
              your certificate must remain independently verifiable indefinitely. If you deactivate your account,
              we stop using your data for anything other than what&apos;s legally or operationally necessary (for
              example, keeping a financial record of a payment you made).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">6. Your Rights</h2>
            <p>
              You can review and update your name and phone number, change your password, or deactivate your
              account at any time from your Dashboard. Deactivating is a soft action — it blocks sign-in and stops
              further use of your data, while letting BEMS staff restore your account if you ask us to. To request
              a copy of your data or ask us to delete it outright, contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">7. Data Security</h2>
            <p>
              Passwords are never stored in plain text. Payment processing is handled by Paystack, a PCI-DSS
              compliant provider — we never see or store your card number. All traffic between your browser and our
              servers is encrypted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">8. Children&apos;s Privacy</h2>
            <p>
              The Program is intended for secondary-school leavers and above. We do not knowingly collect personal
              information from children under 16 without a parent or guardian&apos;s involvement in the enrollment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We&apos;ll update the date at the top of this
              page when we do.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">10. Contact Us</h2>
            <p>
              For any privacy question or data request, reach us at{" "}
              <a href="mailto:admissions@bemsinstitute.ng" className="text-[#AE54C6] font-semibold">
                admissions@bemsinstitute.ng
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
