import { Navigate, useParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { ProjectDetailView } from "../components/Projects";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { findLocalizedProject } from "../lib/projects";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useApp();
  // Look up across all maturities so draft URLs remain reviewable (noindex).
  const project = slug ? findLocalizedProject(lang, slug) : undefined;

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
