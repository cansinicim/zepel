import { ADMIN_ACTIONS } from "./labels";
import { SubmitButton } from "./submit-button";
import type { ButtonSize, ButtonVariant } from "@/components/ui";

export interface ConfirmFormProps {
  /** Kayıt kimliğini FormData ile alan sunucu eylemi. */
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  /** Verilirse gönderimden önce onay istenir. */
  confirmMessage?: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Tek kayda uygulanan eylem formu (yayınla, arşivle, okundu işaretle).
 *
 * Kimlik gizli alanla taşınır; eylem tarafında yetki ve kimlik doğrulaması
 * yeniden yapılır, istemciden gelen hiçbir değer güvenilir sayılmaz.
 */
export function ConfirmForm({
  action,
  id,
  label,
  confirmMessage,
  pendingLabel = ADMIN_ACTIONS.working,
  variant = "outline",
  size = "sm",
}: ConfirmFormProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        pendingLabel={pendingLabel}
        confirmMessage={confirmMessage}
        variant={variant}
        size={size}
      >
        {label}
      </SubmitButton>
    </form>
  );
}
