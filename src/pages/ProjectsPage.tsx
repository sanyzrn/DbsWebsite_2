import { useEffect } from "react";
import Projects from "../components/Projects";
import { useApp } from "../lib/app";
import { applyDocumentSeo } from "../lib/seo";

export default function ProjectsPage() {
  const { lang } = useApp();

  useEffect(() => {
    applyDocumentSeo(lang, "projects");
  }, [lang]);

  return <Projects mode="full" />;
}
