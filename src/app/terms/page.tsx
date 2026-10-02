import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl sm:text-4xl font-black text-[#303654] mb-2">Terms of Admission</h1>
        <p className="text-xs text-[#8580A3] mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-sm text-[#4A4568] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">1. Acceptance of These Terms</h2>
            <p>
              By registering interest, enrolling, or paying any fee for a BEMS FutureSkills Accelerator course
              (&quot;the Program&quot;), you agree to these Terms of Admission. If you do not agree, please do not
              enroll.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">2. Enrollment &amp; Delivery Mode</h2>
            <p>
              Enrollment is confirmed once your selected payment plan is paid and verified by BEMS Admissions. You
              may choose to attend physically at a BEMS lab in Umuahia, or virtually via live Zoom classes, subject
              to seat availability for your chosen cohort.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">3. Fees &amp; Payment</h2>
            <p className="mb-2">
              Course fees may be paid in full (at a discount) or in three installments, as shown at checkout. Your
              classroom access unlocks once your first payment is confirmed — either automatically (card/bank
              transfer via Paystack) or manually by BEMS Admissions (for direct bank transfers, confirmed against
              the reference you provide).
            </p>
            <p>
              Outstanding installments remain due on the schedule communicated to you at enrollment. BEMS reserves
              the right to pause access for accounts with significantly overdue balances, after reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">4. Refund Policy</h2>
            <p>
              Refunds are considered on a case-by-case basis at BEMS&apos;s discretion and are processed manually by
              Admissions — there is no automatic refund trigger. If a refund is approved, it will be recorded
              against your enrollment and your course access will be withdrawn from that point. To request a
              refund, contact BEMS Admissions directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">5. Second Chance Policy</h2>
            <p>
              A student who falls behind or stops attending may, at BEMS&apos;s discretion, be offered a one-time
              opportunity to rejoin a future cohort free of any remaining balance, picking up from their existing
              progress. This second chance is available once per student, for the lifetime of your enrollment with
              BEMS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">6. Attendance &amp; Communication</h2>
            <p>
              Regular attendance is expected at both live classes and the cohort&apos;s welcome session. If you miss
              classes, BEMS may reach out via in-app notification, WhatsApp, or phone to check in and help you catch
              up. Recordings of virtual classes, where available, are provided for revision and are not a substitute
              for live attendance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">7. Academic Integrity</h2>
            <p>
              All milestone projects and your final capstone project must be your own original work. Submitting
              someone else&apos;s work, or work substantially copied without attribution, as your own may result in
              a failing grade, withholding of your certificate, or dismissal from the Program without refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">8. Certification</h2>
            <p>
              A BEMS Verified Certificate, with a QR code that anyone can use to independently verify its
              authenticity, is issued once you complete all required lessons, pass the course quiz, and your
              capstone project is graded at or above the passing threshold by a BEMS instructor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">9. Referral Program</h2>
            <p>
              If you refer a friend who enrolls and completes a paid installment, you may receive referral credit as
              described on the Referral card in your dashboard at the time of the referral. Referral credit has no
              cash value and cannot be redeemed for cash.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">10. Graduate Opportunities</h2>
            <p>
              BEMS may, at its sole discretion, invite outstanding graduates to return as paid teaching assistants,
              or introduce graduates to BEMS Group companies or partner employers. None of this is guaranteed by
              enrollment or completion of the Program — BEMS promises job-readiness and genuine introductions, not a
              guaranteed job offer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">11. Changes to These Terms</h2>
            <p>
              BEMS may update these Terms of Admission from time to time. Continued enrollment or use of the
              platform after an update constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#303654] mb-2">12. Contact</h2>
            <p>
              Questions about these terms can be directed to BEMS Admissions at{" "}
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
