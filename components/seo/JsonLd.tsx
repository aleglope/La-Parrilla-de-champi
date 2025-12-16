"use client";

import Script from "next/script";

interface JsonLdProps {
  data: Record<string, any>;
  id?: string;
}

export function JsonLd({ data, id = "schema-org" }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      strategy="beforeInteractive"
    />
  );
}
