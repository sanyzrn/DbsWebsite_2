import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ProjectDetailView } from "../components/Projects";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { applyDocumentSeo } from "../lib/seo";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useApp();
  const project = t.projects.items.find((p) => p.id === slug);

  useEffect(() => {
    if (project) applyDocumentSeo(lang, "project", project.name);
  }, [lang, project]);

  if (!project) {
    return <Navigate to={localePath(lang, "/projects")} replace />;
  }

  return <ProjectDetailView project={project} />;
}
