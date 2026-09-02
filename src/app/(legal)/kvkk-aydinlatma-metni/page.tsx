import type { Metadata } from "next";

import {
  LegalDocumentPage,
  legalMetadata,
} from "@/components/legal/legal-document-page";
import { kvkkNotice } from "@/content/legal";

export const metadata: Metadata = legalMetadata(kvkkNotice);

export default function KvkkNoticePage() {
  return <LegalDocumentPage document={kvkkNotice} />;
}
