import { PageMeta } from "../components/PageMeta";
import Projects from "../components/Projects";

export default function ProjectsPage() {
  return (
    <>
      <PageMeta page="projects" />
      <Projects mode="full" />
    </>
  );
}
