import { LegalDocument } from "../components/LegalDocument";
import { PageMeta } from "../components/PageMeta";
import { useApp } from "../lib/app";

export default function PrivacyPage() {
  const { t } = useApp();

  return (
    <>
      <PageMeta page="privacy" />
      <LegalDocument copy={t.privacy} />
    </>
  );
}
