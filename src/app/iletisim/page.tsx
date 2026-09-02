import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ContactDetails } from "@/components/sections/contact-details";
import { ContactForm } from "@/components/sections/contact-form";
import { Container } from "@/components/ui";
import { contactPage } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: contactPage.intro.title,
  description: contactPage.intro.description,
  path: "/iletisim",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader intro={contactPage.intro} />

      <div className="bg-ink">
        <Container width="page" className="py-section-sm">
          <div className="grid gap-block lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
            <div className="lg:col-span-5">
              <ContactDetails />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
