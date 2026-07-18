import { AppProvider, useApp } from "./lib/app";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Expertise from "./components/Expertise";
import { Process, Thinking } from "./components/Thinking";
import Projects from "./components/Projects";
import About, { Skills } from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";

function Shell() {
  const { t } = useApp();
  return (
    <div id="top" className="min-h-screen bg-page font-sans text-ink">
      <a href="#main" className="skip-link">
        {t.a11y.skip}
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Intro />
        <Expertise />
        <Thinking />
        <Process />
        <Projects />
        <About />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
