import { Container, Eyebrow } from "@/components/ui";
import { stats } from "@/content/sections";
import { formatNumber } from "@/lib/format";

/**
 * Rakam şeridi. Her değer `data-stat-target` ile ham sayıyı taşır, böylece
 * motion katmanı sayaç animasyonunu metni yeniden hesaplamadan kurabilir.
 */
export function StatsStrip() {
  return (
    <section
      data-stats
      aria-labelledby="rakamlar-basligi"
      className="border-b border-border bg-surface"
    >
      <Container width="page" className="py-section-sm">
        <div className="flex flex-col gap-block">
          <div className="flex flex-col gap-3">
            <Eyebrow withRule>{stats.eyebrow}</Eyebrow>
            <h2
              id="rakamlar-basligi"
              className="font-display text-display-sm text-text-primary"
            >
              {stats.title}
            </h2>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-block lg:grid-cols-4">
            {stats.items.map((item) => (
              <div
                key={item.id}
                data-stat
                className="flex flex-col gap-2 border-t border-border-strong pt-6"
              >
                {/* HTML, dl içinde dt ve dd sırasını şart koşar. Görsel sıra
                    (önce rakam, sonra etiket) flex order ile kurulur. */}
                <dt className="order-2 flex flex-col gap-1 font-sans">
                  <span className="text-body-md text-text-primary">
                    {item.label}
                  </span>
                  {item.note ? (
                    <span className="text-body-sm text-text-muted">
                      {item.note}
                    </span>
                  ) : null}
                </dt>
                <dd
                  data-stat-value
                  data-stat-target={item.value}
                  className="order-1 font-display text-display-sm text-accent tabular-nums"
                >
                  {item.prefix ?? ""}
                  {formatNumber(item.value)}
                  {item.suffix ?? ""}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
