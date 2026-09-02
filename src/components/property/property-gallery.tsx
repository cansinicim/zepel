"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { propertyDetail } from "@/content/pages";
import { cn } from "@/lib/utils";

export interface PropertyGalleryProps {
  images: readonly string[];
  /** Erişilebilir görsel açıklaması için mülk başlığı. */
  title: string;
}

/**
 * Basit ilan galerisi: büyük görsel ve küçük görsel şeridi.
 * Geçiş efekti bilinçli olarak yoktur; motion katmanı
 * `data-property-gallery-*` kancalarını devralıp geliştirecektir.
 */
export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;
  const activeImage = images[activeIndex];

  if (total === 0 || !activeImage) return null;

  const goTo = (index: number) => {
    setActiveIndex((index + total) % total);
  };

  return (
    <div data-property-gallery className="flex flex-col gap-4">
      <div
        data-property-gallery-main
        className="relative aspect-[16/10] overflow-hidden border border-border bg-elevated"
      >
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${title}, ${propertyDetail.galleryThumbPrefix} ${activeIndex + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />

        {total > 1 ? (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label={propertyDetail.galleryPrevLabel}
                className="inline-flex size-11 items-center justify-center rounded-xs border border-border-strong bg-overlay/85 text-text-primary backdrop-blur-sm transition-colors duration-[var(--duration-fast)] hover:border-accent hover:text-accent"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                aria-label={propertyDetail.galleryNextLabel}
                className="inline-flex size-11 items-center justify-center rounded-xs border border-border-strong bg-overlay/85 text-text-primary backdrop-blur-sm transition-colors duration-[var(--duration-fast)] hover:border-accent hover:text-accent"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>

            <p
              aria-live="polite"
              className="rounded-xs bg-overlay/85 px-3 py-1 font-sans text-eyebrow tracking-eyebrow text-text-secondary uppercase tabular-nums backdrop-blur-sm"
            >
              {activeIndex + 1} / {total}
            </p>
          </div>
        ) : null}
      </div>

      {total > 1 ? (
        <ul
          aria-label={propertyDetail.galleryThumbsLabel}
          className="grid grid-cols-4 gap-3 sm:grid-cols-6"
        >
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={image}>
                <button
                  type="button"
                  data-property-gallery-thumb
                  data-index={index}
                  aria-pressed={isActive}
                  aria-label={`${propertyDetail.galleryThumbPrefix} ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative block aspect-[4/3] w-full overflow-hidden border bg-elevated",
                    "transition-colors duration-[var(--duration-fast)] ease-out-expo",
                    isActive
                      ? "border-accent"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(min-width: 640px) 16vw, 25vw"
                    className={cn(
                      "object-cover transition-opacity duration-[var(--duration-fast)]",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
