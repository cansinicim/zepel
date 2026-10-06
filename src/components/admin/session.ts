import { redirect } from "next/navigation";

import { isSignedIn } from "@/lib/admin-auth";

import { ADMIN_PATHS } from "./labels";

/**
 * Panel sayfalarının sunucu tarafı kapısı.
 *
 * Giriş sayfası dışındaki her admin sayfası ilk satırında bunu çağırır.
 * Sayfa korumasının sunucu eylemlerini korumadığını unutmayın: eylemler
 * kendi uç noktalarıdır ve ayrıca `requireAdmin()` çağırır.
 */
export async function requireSession(): Promise<void> {
  if (!(await isSignedIn())) {
    redirect(ADMIN_PATHS.login);
  }
}
