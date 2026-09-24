import { LegalDocument } from "../components/LegalDocument";
import { PageMeta } from "../components/PageMeta";
import { useApp } from "../lib/app";

export default function TermsPage() {
  const { t } = useApp();

  return (
    <>
      <PageMeta page="terms" />
      <LegalDocument copy={t.terms} />
    </>
  );
}
