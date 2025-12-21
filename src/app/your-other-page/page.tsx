"use client";

import dynamic from "next/dynamic";

const HeavySection = dynamic(
  () => import("@/components/your-folder/HeavySection"),
  { ssr: false } // no `loading` option => no intermediate "Loading..." text
);

export default function YourOtherPage() {
  // ...existing code...

  return (
    <>
      {/* ...existing layout... */}
      <HeavySection /* ...props... */ />
      {/* ...existing layout... */}
    </>
  );
}