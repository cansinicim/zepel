import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ContactCta } from "@/components/sections/contact-cta";
import { ProcessSteps } from "@/components/sections/process-steps";
import { ServicesDetail } from "@/components/sections/services-detail";
import { servicesPage } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: servicesPage.intro.title,
  description: servicesPage.intro.description,
  path: "/hizmetler",
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader intro={servicesPage.intro} />
      <ServicesDetail />
      <ProcessSteps />
      <ContactCta />
    </>
  );
}
