import { useEffect } from "react";
import Hero from "../components/Hero";
import Intro from "../components/Intro";
import Expertise from "../components/Expertise";
import { Process, Thinking } from "../components/Thinking";
import Projects from "../components/Projects";
import { useApp } from "../lib/app";
import { applyDocumentSeo } from "../lib/seo";

export default function HomePage() {
  const { lang } = useApp();

  useEffect(() => {
    applyDocumentSeo(lang, "home");
  }, [lang]);

  return (
    <>
      <Hero />
      <Intro />
      <Expertise />
      <Thinking />
      <Process />
      <Projects mode="teaser" />
    </>
  );
}
