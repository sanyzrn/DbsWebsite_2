import Hero from "../components/Hero";
import Intro from "../components/Intro";
import Expertise from "../components/Expertise";
import { Process, Thinking } from "../components/Thinking";
import Projects from "../components/Projects";
import { PageMeta } from "../components/PageMeta";

export default function HomePage() {
  return (
    <>
      <PageMeta page="home" />
      <Hero />
      <Intro />
      <Expertise />
      <Thinking />
      <Process />
      <Projects mode="teaser" />
    </>
  );
}
