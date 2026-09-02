import {
  Building2,
  Globe2,
  KeyRound,
  Landmark,
  LineChart,
  ScrollText,
  Square,
  type LucideIcon,
} from "lucide-react";

/**
 * İçerik katmanı ikonları string olarak taşır (`service.icon`, `socialLink.icon`).
 * Dinamik import yerine açık bir kayıt defteri kullanılır: böylece bundle
 * içeriği derleme zamanında bellidir ve bilinmeyen bir ad çalışma zamanında
 * hataya değil, nötr bir yedek ikona düşer.
 *
 * İçeriğe yeni bir ikon adı eklendiğinde buraya da eklenmelidir.
 */
const iconRegistry: Record<string, LucideIcon> = {
  Building2,
  Globe2,
  KeyRound,
  Landmark,
  LineChart,
  ScrollText,
};

/** Kayıtta bulunmayan adlar için nötr yedek. */
export const fallbackIcon: LucideIcon = Square;

export function resolveIcon(name: string): LucideIcon {
  return iconRegistry[name] ?? fallbackIcon;
}
