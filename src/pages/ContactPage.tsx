import Contact from "../components/Contact";
import { PageMeta } from "../components/PageMeta";
import Testimonials from "../components/Testimonials";

export default function ContactPage() {
  return (
    <>
      <PageMeta page="contact" />
      <Testimonials />
      <Contact variant="page" />
    </>
  );
}
