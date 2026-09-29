"use client";

import React, { Suspense } from "react";
import { EduportCheckoutView } from "@/components/EduportCheckoutView";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-sm text-[#747579]">
          Loading Checkout...
        </div>
      }
    >
      <EduportCheckoutView />
    </Suspense>
  );
}
