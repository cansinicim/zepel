import { cn } from "@/lib/utils";

/**
 * Zepel amblemi: eş kenar üçgenler ve eğik banttan kurulu geometrik Z.
 *
 * Tek renklidir ve `currentColor` kullanır, böylece koyu ve açık zeminde
 * sarmalayıcının metin rengini devralır. Boyut `className` ile verilir
 * (örn. `size-8`), varsayılan olarak `1em` genişliğinde akar.
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
      viewBox="0 0 200 200"
      fill="currentColor"
      className={cn("size-[1em]", className)}
      role={isDecorative ? "presentation" : "img"}
      aria-hidden={isDecorative ? "true" : undefined}
      aria-label={title}
      focusable="false"
    >
      {/* Üst çubuk, ortadaki beyaz kanalla iki üçgene ayrılır. */}
      <polygon points="0,0 70,0 0,70" />
      <polygon points="130,0 200,0 200,70" />
      {/* Z'nin eğik gövdesi: uçları 45 derece kesilmiş paralelkenar. */}
      <polygon points="0,130 70,60 200,60 130,130" />
      {/* Alt çubuk. */}
      <polygon points="0,130 70,200 0,200" />
      <polygon points="130,200 200,130 200,200" />
    </svg>
  );
}
