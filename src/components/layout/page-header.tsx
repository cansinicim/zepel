import { Container, SectionHeading } from "@/components/ui";
import type { PageIntro } from "@/content/pages";

export interface PageHeaderProps {
  intro: PageIntro;
}

/**
 * Alt sayfaların üst bloğu. Sayfadaki tek `h1` buradan gelir,
 * sabit üst bar ile çakışmaması için üstten ekstra boşluk bırakır.
 */
export function PageHeader({ intro }: PageHeaderProps) {
  return (
    <section data-page-header className="border-b border-border bg-ink">
      <Container
        width="page"
        className="pt-32 pb-section-sm md:pt-40 lg:pt-48"
      >
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow={intro.eyebrow}
          title={intro.title}
          description={intro.description}
          data-reveal
        />
      </Container>
    </section>
  );
}
