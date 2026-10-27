import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../lib/app";
import { StudioDiscovery, StudioSignature } from "../components/StudioFamily";


afterEach(cleanup);

it("opens the product family, closes on Escape and restores focus", async () => {
  render(<MemoryRouter initialEntries={["/en/nex"]}><AppProvider><StudioSignature /></AppProvider></MemoryRouter>);
  const toggle = screen.getByRole("button", { hidden: true, name: "From the studio" });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { hidden: true, name: /NexaChatAI/ })).toHaveAttribute("href", "/en/nexachatai");
  expect(screen.getByRole("link", { hidden: true, name: /Nex Your second memory/ })).toHaveAttribute("aria-current", "page");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
});

it("links to the other live product and collaboration in the same locale", async () => {
  render(<MemoryRouter initialEntries={["/en/nex"]}><AppProvider><StudioDiscovery /></AppProvider></MemoryRouter>);
  expect(screen.getByRole("link", { hidden: true, name: /NexaChatAI/ })).toHaveAttribute("href", "/en/nexachatai");
  expect(screen.getByRole("link", { hidden: true, name: "Start a project" })).toHaveAttribute("href", "/en/contact");
  expect(screen.queryByRole("link", { hidden: true, name: /Nex Your second memory/ })).not.toBeInTheDocument();
});
