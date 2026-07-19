import { Navigate, useParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { ProjectDetailView } from "../components/Projects";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useApp();
  const project = t.projects.items.find((p) => p.id === slug || p.slug === slug);

  if (!project || !slug) {
    return <Navigate to={localePath(lang, "/projects")} replace />;
  }

  return (
    <>
      <PageMeta page="project" slug={slug} />
      <ProjectDetailView project={project} />
    </>
  );
}
