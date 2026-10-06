import { AboutIntro } from "@/components/sections/about-intro";
import { ContactCta } from "@/components/sections/contact-cta";
import { FeaturedPortfolio } from "@/components/sections/featured-portfolio";
import { HeroSection } from "@/components/sections/hero-section";
import { ProcessSteps } from "@/components/sections/process-steps";
import { ScrollStorySection } from "@/components/sections/scroll-story-section";
import { ServicesOverview } from "@/components/sections/services-overview";
import { StatsStrip } from "@/components/sections/stats-strip";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { listPublished, toProperty } from "@/lib/db/listings";

/**
 * Öne çıkan bölümde gösterilecek azami ilan sayısı. Grid üç sütunlu olduğu
 * için iki tam satır hedeflenir.
 */
const FEATURED_LISTINGS_LIMIT = 6;

/**
 * Bu sayfa kasıtlı olarak istek anında (dinamik) render edilir.
 *
 * D1 bağlantısı yalnızca Cloudflare çalışma zamanında (gerçek bir istek
 * sırasında) vardır, `next build` sırasında yoktur. Sayfa varsayılan
 * (statik) modda kalsaydı Next bu bileşeni derleme sırasında önceden
 * üretmeye çalışır ve D1 erişimi olmadığı için derleme çöker. `force-dynamic`
 * ile üretim build'i bu rotayı hiç önceden üretmez; öne çıkan ilanlar her
 * istekte veritabanından taze okunur, `/portfoy` sayfasıyla aynı stratejidir.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredListings = await listPublished({
    featured: true,
    limit: FEATURED_LISTINGS_LIMIT,
  });
  const featuredProperties = featuredListings.map(toProperty);

  return (
    <>
      <HeroSection />
      <AboutIntro />
      <StatsStrip />
      <ScrollStorySection />
      <FeaturedPortfolio properties={featuredProperties} />
      <ServicesOverview />
      <ProcessSteps />
      <TestimonialsSection />
      <ContactCta />
    </>
  );
}
