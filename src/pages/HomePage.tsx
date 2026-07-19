import Hero from "../components/Hero";
import Intro from "../components/Intro";
import { Process } from "../components/Thinking";
import Projects from "../components/Projects";
import { PageMeta } from "../components/PageMeta";

export default function HomePage() {
  return (
    <>
      <PageMeta page="home" />
      <Hero />
      <Intro />
      <Projects mode="teaser" />
      <Process />
    </>
  );
}
