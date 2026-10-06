import { cn } from "@/lib/utils";

/**
 * Zepel amblemi.
 *
 * Geometri, marka dosyasının piksel taramasından çıkarılmıştır; göz kararı
 * çizim değildir. Kaynak 595x595 görselde amblem x 202-392, y 112-309
 * aralığında durur ve buradaki viewBox o kutuya taşınmış halidir (190x197).
 *
 * Beş parça: solda tabanı altta duran iki üçgen, sağda tepesi üstte duran iki
 * üçgen, ortada Z'nin gövdesini kuran paralelkenar. Üçgen dik kenarları 64
 * birim, paralelkenarın eğimi 90/70'tir.
 *
 * Tek renklidir ve `currentColor` kullanır, böylece koyu ve açık zeminde
 * sarmalayıcının metin rengini devralır. Boyut `className` ile verilir.
 */
type ZepelMarkProps = {
  className?: string;
  /** Erişilebilir isim. Verilmezse amblem dekoratif kabul edilir. */
  title?: string;
};

export function ZepelMark({ className, title }: ZepelMarkProps) {
  const isDecorative = title === undefined;

  return (
    <svg
      viewBox="0 0 190 197"
      fill="currentColor"
      className={cn("size-[1em]", className)}
      role={isDecorative ? "presentation" : "img"}
      aria-hidden={isDecorative ? "true" : undefined}
      aria-label={title}
      focusable="false"
    >
      {/* Sol üst üçgen: dik açı sol altta, hipotenüs sol üstten sağ alta. */}
      <polygon points="0,0 0,64 64,64" />
      {/* Sağ üst üçgen: dik açı sağ üstte. */}
      <polygon points="125,0 189,0 189,64" />
      {/* Z gövdesi: aşağı indikçe sola kayan paralelkenar. */}
      <polygon points="90,64 188,64 98,134 0,134" />
      {/* Sol alt üçgen, sol üsttekinin birebir kopyası. */}
      <polygon points="0,134 0,197 63,197" />
      {/* Sağ alt üçgen, sağ üsttekinin birebir kopyası. */}
      <polygon points="126,134 189,134 189,197" />
    </svg>
  );
}
