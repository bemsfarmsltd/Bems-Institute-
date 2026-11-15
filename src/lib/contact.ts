// Public contact details, set as Vercel environment variables once the
// owner has real ones (NEXT_PUBLIC_CONTACT_PHONE, NEXT_PUBLIC_CONTACT_EMAIL,
// NEXT_PUBLIC_CONTACT_ADDRESS). Every place that shows one hides it while
// it's empty: the site must never show a placeholder that could belong to
// a stranger.
const clean = (v: string | undefined) => (v ?? "").trim();

export const CONTACT = {
  phone: clean(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  address: clean(process.env.NEXT_PUBLIC_CONTACT_ADDRESS)
};
