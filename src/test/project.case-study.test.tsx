import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { ProjectDetailView } from "../components/Projects";
import { AppProvider } from "../lib/app";
import { dictionaries } from "../lib/i18n";
import { getLocalizedProjects, localizeProject, type ProjectContent } from "../lib/projects";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("project case-study detail rendering", () => {
  it("renders problem/approach/result on the Persian detail route", () => {
    const pulse = getLocalizedProjects("fa").find((p) => p.slug === "dbspulse");
    expect(pulse?.problem).toBeTruthy();
    window.history.pushState(null, "", "/projects/dbspulse");
    render(<App />);
    expect(screen.getByText(dictionaries.fa.projects.problemLabel)).toBeTruthy();
    expect(screen.getByText(dictionaries.fa.projects.approachLabel)).toBeTruthy();
    expect(screen.getByText(dictionaries.fa.projects.resultLabel)).toBeTruthy();
    expect(screen.getByText(pulse!.problem)).toBeTruthy();
    expect(screen.getByText(pulse!.approach)).toBeTruthy();
    expect(screen.getByText(pulse!.result)).toBeTruthy();
  });

  it("renders problem/approach/result on the English detail route", () => {
    const pulse = getLocalizedProjects("en").find((p) => p.slug === "dbspulse");
    window.history.pushState(null, "", "/en/projects/dbspulse");
    render(<App />);
    expect(screen.getByText(dictionaries.en.projects.problemLabel)).toBeTruthy();
    expect(screen.getByText(pulse!.problem)).toBeTruthy();
    expect(screen.getByText(pulse!.result)).toBeTruthy();
  });

  it("omits the metadata row when optional case-study fields are empty", () => {
    const pulse = getLocalizedProjects("en").find((p) => p.slug === "dbspulse");
    expect(pulse).toBeTruthy();
    expect(pulse!.year).toBeUndefined();
    expect(pulse!.durationMonths).toBeUndefined();
    expect(pulse!.teamSize).toBeUndefined();
    expect(pulse!.clientType).toBeUndefined();
    expect(pulse!.links).toBeUndefined();

    window.history.pushState(null, "", "/en/projects/dbspulse");
    render(<App />);
    expect(screen.queryByText(dictionaries.en.projects.metaYear)).toBeNull();
    expect(screen.queryByText(dictionaries.en.projects.metaDuration)).toBeNull();
    expect(screen.queryByText(dictionaries.en.projects.metaTeam)).toBeNull();
    expect(screen.queryByText(dictionaries.en.projects.metaClient)).toBeNull();
    expect(screen.queryByText(dictionaries.en.projects.metaLinks)).toBeNull();
  });

  it("renders only populated metadata fields on the detail view", () => {
    const base = getLocalizedProjects("en").find((p) => p.slug === "dbspulse");
    expect(base).toBeTruthy();

    const withMeta: ProjectContent = {
      id: base!.id,
      slug: base!.slug,
      status: base!.status,
      maturity: "published",
      featured: base!.featured,
      order: base!.order,
      name: { fa: base!.name, en: base!.name },
      subtitle: { fa: base!.subtitle, en: base!.subtitle },
      desc: { fa: base!.desc, en: base!.desc },
      problem: { fa: base!.problem, en: base!.problem },
      approach: { fa: base!.approach, en: base!.approach },
      result: { fa: base!.result, en: base!.result },
      role: { fa: base!.role, en: base!.role },
      tech: base!.tech,
      tags: base!.tags,
      image_url: null,
      year: "2025",
      teamSize: "Solo",
      clientType: {
        fa: "شرکت دارویی، منابع انسانی داخلی",
        en: "Pharmaceutical company, internal HR department",
      },
      links: [{ label: { fa: "دمو", en: "Demo" }, href: "https://example.com/demo" }],
    };

    const project = localizeProject(withMeta, "en");
    render(
      <MemoryRouter initialEntries={["/en/projects/dbspulse"]}>
        <AppProvider>
          <ProjectDetailView project={project} />
        </AppProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(dictionaries.en.projects.metaYear)).toBeTruthy();
    expect(screen.getByText("2025")).toBeTruthy();
    expect(screen.getByText(dictionaries.en.projects.metaTeam)).toBeTruthy();
    expect(screen.getByText("Solo")).toBeTruthy();
    expect(screen.getByText(dictionaries.en.projects.metaClient)).toBeTruthy();
    expect(screen.getByText("Pharmaceutical company, internal HR department")).toBeTruthy();
    expect(screen.getByText(dictionaries.en.projects.metaLinks)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute("href", "https://example.com/demo");
    expect(screen.queryByText(dictionaries.en.projects.metaDuration)).toBeNull();
  });
});
