import type { Metadata } from "next";

import {
  LegalDocumentPage,
  legalMetadata,
} from "@/components/legal/legal-document-page";
import { termsOfUse } from "@/content/legal";

export const metadata: Metadata = legalMetadata(termsOfUse);

export default function TermsOfUsePage() {
  return <LegalDocumentPage document={termsOfUse} />;
}
