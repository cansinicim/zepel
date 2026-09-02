import type { Metadata } from "next";

import {
  LegalDocumentPage,
  legalMetadata,
} from "@/components/legal/legal-document-page";
import { cookiePolicy } from "@/content/legal";

export const metadata: Metadata = legalMetadata(cookiePolicy);

export default function CookiePolicyPage() {
  return <LegalDocumentPage document={cookiePolicy} />;
}
