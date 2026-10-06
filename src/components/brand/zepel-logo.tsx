import { ZepelMark } from "@/components/brand/zepel-mark";
import { cn } from "@/lib/utils";

/**
 * Zepel logo kilitlemesi: amblem + "ZEPEL" kelime markası + "GAYRİMENKUL"
 * alt satırı.
 *
 * Oranlar marka dosyasından ölçülmüştür (595x595 kaynak):
 *   amblem 191x198, ZEPEL kapak yüksekliği 85, GAYRİMENKUL kapak yüksekliği 24,
 *   amblem ile ZEPEL arası 42, ZEPEL ile alt satır arası 24.
 * Buradan türetilen oranlar: ZEPEL kapağı amblem yüksekliğinin 0.43 katı,
 * alt satır ZEPEL'in 0.28 katı. `stacked` bu oranları birebir uygular.
 *
 * Ölçek tek noktadan yönetilir: kök `font-size` (Tailwind ile `text-[18px]`)
 * tüm parçaları orantılı büyütür, çünkü iç ölçüler `em` tabanlıdır. Renk
 * `currentColor` üzerinden gelir.
 */
type ZepelLogoProps = {
  /** yatay: amblem solda, kelime markası sağda. dikey: amblem üstte, ortalanmış. */
  variant?: "horizontal" | "stacked";
  className?: string;
};

/**
 * Metin DOM'da normal yazımıyla durur, büyük harfe CSS ile çevrilir.
 * Sebep: erişilebilir ad ile görünen metnin eşleşmesi gerekir ve Türkçede
 * "GAYRİMENKUL" ile "Gayrimenkul" karşılaştırması İ/i dönüşümü yüzünden
 * bozulur. Kök `lang="tr"` olduğu için tarayıcı dönüşümü doğru yapar.
 */
const WORDMARK = "Zepel";
const SUBLINE = "Gayrimenkul";

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
          ? "flex-col items-center gap-[0.34em]"
          : "flex-row items-center gap-[0.5em]",
        className,
      )}
    >
      {/* Amblem 190x197 oranındadır, bu yüzden yükseklik verilir, genişlik akar. */}
      <ZepelMark
        className={cn("w-auto", isStacked ? "h-[1.63em]" : "h-[1.5em]")}
      />

      <span
        className={cn(
          "flex flex-col",
          isStacked ? "items-center gap-[0.2em]" : "items-start gap-[0.18em]",
        )}
      >
        <span className="text-[1em] font-semibold tracking-[0.14em] uppercase">
          {WORDMARK}
        </span>
        <span className="text-[0.3em] font-medium tracking-[0.22em] uppercase opacity-80">
          {SUBLINE}
        </span>
      </span>
    </span>
  );
}
