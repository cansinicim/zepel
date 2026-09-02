import { ZepelMark } from "@/components/brand/zepel-mark";
import { cn } from "@/lib/utils";

/**
 * Zepel logo kilitlemesi: amblem + "ZEPEL" kelime markası + "GAYRİMENKUL" alt satırı.
 *
 * Ölçek tek noktadan yönetilir: bileşenin kök `font-size` değeri (Tailwind ile
 * `text-[18px]` gibi) tüm parçaları orantılı büyütür, çünkü iç ölçüler `em`
 * tabanlıdır. Renk `currentColor` üzerinden gelir.
 */
type ZepelLogoProps = {
  /** yatay: amblem solda, kelime markası sağda. dikey: amblem üstte, ortalanmış. */
  variant?: "horizontal" | "stacked";
  className?: string;
};

const WORDMARK = "ZEPEL";
const SUBLINE = "GAYRİMENKUL";

export function ZepelLogo({
  variant = "horizontal",
  className,
}: ZepelLogoProps) {
  const isStacked = variant === "stacked";

  return (
    <span
      className={cn(
        "inline-flex font-sans leading-none",
        isStacked
          ? "flex-col items-center gap-[0.5em]"
          : "flex-row items-center gap-[0.55em]",
        className,
      )}
    >
      <ZepelMark className={isStacked ? "size-[2.4em]" : "size-[1.6em]"} />

      <span
        className={cn(
          "flex flex-col",
          isStacked ? "items-center gap-[0.3em]" : "items-start gap-[0.22em]",
        )}
      >
        <span className="text-[1em] font-semibold tracking-[0.16em]">
          {WORDMARK}
        </span>
        <span className="text-[0.42em] font-medium tracking-[0.34em] opacity-80">
          {SUBLINE}
        </span>
      </span>
    </span>
  );
}
