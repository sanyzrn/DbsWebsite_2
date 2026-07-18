import { AppProvider } from "./lib/app";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Expertise from "./components/Expertise";
import { Process, Thinking } from "./components/Thinking";
import Projects from "./components/Projects";
import About, { Skills } from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-page font-sans text-ink">
        <Nav />
        <main>
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
      </div>
    </AppProvider>
  );
}
