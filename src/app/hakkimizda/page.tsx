import type { Metadata } from "next";

import { AboutIntro } from "@/components/sections/about-intro";
import { ContactCta } from "@/components/sections/contact-cta";
import { ProcessSteps } from "@/components/sections/process-steps";
import { StatsStrip } from "@/components/sections/stats-strip";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { about } from "@/content/sections";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: about.title,
  description: about.paragraphs[0],
  path: "/hakkimizda",
});

export default function AboutPage() {
  return (
    <>
      <AboutIntro as="h1" withPageOffset />
      <StatsStrip />
      <ProcessSteps />
      <TestimonialsSection />
      <ContactCta />
    </>
  );
}
