import { Quote } from "lucide-react";

import { Container, SectionHeading } from "@/components/ui";
import { testimonials } from "@/content/sections";

export function TestimonialsSection() {
  return (
    <section
      id="referanslar"
      data-testimonials
      aria-labelledby="referanslar-basligi"
      className="scroll-mt-24 border-b border-border bg-ink"
    >
      <Container width="page" className="flex flex-col gap-block py-section">
        <SectionHeading
          titleId="referanslar-basligi"
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          data-reveal
        />

        <ul className="grid gap-6 lg:grid-cols-3">
          {testimonials.items.map((testimonial, index) => (
            <li
              key={testimonial.id}
              data-testimonial
              data-index={index}
              className="flex flex-col gap-6 border border-border bg-surface p-6 sm:p-8"
            >
              <Quote
                aria-hidden="true"
                className="size-6 shrink-0 text-accent"
              />

              <figure className="flex flex-1 flex-col gap-6">
                <blockquote className="flex-1 font-sans text-body-md text-text-secondary">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="flex flex-col gap-1 border-t border-border pt-5">
                  <span className="font-display text-heading-md text-text-primary">
                    {testimonial.name}
                  </span>
                  <span className="font-sans text-body-sm text-text-muted">
                    {testimonial.title}, {testimonial.city}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
