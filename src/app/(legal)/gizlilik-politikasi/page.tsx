import type { Metadata } from "next";

import {
  LegalDocumentPage,
  legalMetadata,
} from "@/components/legal/legal-document-page";
import { privacyPolicy } from "@/content/legal";

export const metadata: Metadata = legalMetadata(privacyPolicy);

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage document={privacyPolicy} />;
}
