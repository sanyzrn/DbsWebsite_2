import Contact from "../components/Contact";
import { PageMeta } from "../components/PageMeta";

/** Dedicated, indexable contact destination — modal on About remains a shortcut. */
export default function ContactPage() {
  return (
    <>
      <PageMeta page="contact" />
      <Contact variant="page" />
    </>
  );
}
