import { Container, SectionHeading } from "@/components/ui";
import { process } from "@/content/sections";

/** Dört adımlı çalışma süreci. Kemik zeminde, hizmetlerin devamı olarak okunur. */
export function ProcessSteps() {
  return (
    <section
      id="surec"
      data-process
      aria-labelledby="surec-basligi"
      className="scroll-mt-24 border-b border-bone-border bg-bone-muted"
    >
      <Container width="page" className="flex flex-col gap-block py-section">
        <SectionHeading
          titleId="surec-basligi"
          tone="light"
          eyebrow={process.eyebrow}
          title={process.title}
          description={process.description}
          data-reveal
        />

        <ol className="grid gap-x-8 gap-y-block sm:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step, index) => (
            <li
              key={step.number}
              data-process-step
              data-step-index={index}
              className="flex flex-col gap-4 border-t border-bone-border pt-6"
            >
              <span
                aria-hidden="true"
                className="font-display text-display-sm text-accent-deep tabular-nums"
              >
                {step.number}
              </span>
              <h3 className="font-display text-heading-lg text-ink-text">
                {step.title}
              </h3>
              <p className="font-sans text-body-sm text-ink-text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
