import { Router } from "express";
import { getBankTransferDetails } from "@/lib/site-settings";

// Public, read-only settings the site needs before sign-in.
const router = Router();

// The account students pay tuition into by bank transfer, or null while an
// admin hasn't set one (the page then hides the bank-transfer option).
router.get("/bank-transfer", async (_req, res) => {
  return res.json({ bankTransfer: await getBankTransferDetails() });
});

export default router;
