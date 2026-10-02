import { app } from "@/app";

const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Defense-in-depth for anything that rejects outside an Express request
// context (a stray setTimeout/background call express-async-errors above
// can't see) — log it instead of letting Node crash the whole process.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

app.listen(PORT, () => {
  console.log(`BEMS backend listening on port ${PORT}`);
  console.log(`Allowed frontend origin(s): ${allowedOrigins.join(", ")}`);
});
