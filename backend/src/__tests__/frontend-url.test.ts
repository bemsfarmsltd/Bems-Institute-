import { describe, it, expect, afterEach } from "vitest";
import { frontendUrl } from "@/lib/email";

const original = process.env.FRONTEND_URL;
afterEach(() => {
  process.env.FRONTEND_URL = original;
});

describe("frontendUrl", () => {
  it("builds links from the first site when several are allowed", () => {
    process.env.FRONTEND_URL = "https://www.bemsinstitute.com/, https://bemsinstitute.com,https://bems-institute.vercel.app";
    expect(frontendUrl("/reset-password?token=abc")).toBe("https://www.bemsinstitute.com/reset-password?token=abc");
  });
});
