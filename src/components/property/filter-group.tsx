import type { FilterOption } from "@/content/properties";
import { cn } from "@/lib/utils";

export interface FilterGroupProps<TValue extends string> {
  label: string;
  allLabel: string;
  options: readonly FilterOption<TValue>[];
  /** `null` seçili değilken, yani "tümü" durumunda. */
  value: TValue | null;
  onChange: (value: TValue | null) => void;
}

/**
 * Tek bir filtre grubu. Sunum sorumluluğu taşır, durumu dışarıdan alır.
 * `aria-pressed` ile çoklu seçim değil, tek seçim davranışı bildirilir.
 */
export function FilterGroup<TValue extends string>({
  label,
  allLabel,
  options,
  value,
  onChange,
}: FilterGroupProps<TValue>) {
  const buttonClass = (isActive: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-2 rounded-pill border px-4",
      "font-sans text-body-sm whitespace-nowrap",
      "transition-colors duration-[var(--duration-fast)] ease-out-expo",
      isActive
        ? "border-accent bg-accent-soft text-accent"
        : "border-border bg-transparent text-text-secondary hover:border-border-strong hover:text-text-primary",
    );

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3">
      <span className="font-sans text-eyebrow tracking-eyebrow text-text-muted uppercase">
        {label}
      </span>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={value === null}
          onClick={() => onChange(null)}
          className={buttonClass(value === null)}
        >
          {allLabel}
        </button>

        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(isActive ? null : option.value)}
              className={buttonClass(isActive)}
            >
              {option.label}
              <span
                aria-hidden="true"
                className="text-text-muted tabular-nums"
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
