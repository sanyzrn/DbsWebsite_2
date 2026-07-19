import Contact from "../components/Contact";
import { PageMeta } from "../components/PageMeta";

export default function ContactPage() {
  return (
    <>
      <PageMeta page="contact" />
      <Contact variant="page" />
    </>
  );
}
