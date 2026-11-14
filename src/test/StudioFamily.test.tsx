import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../lib/app";
import { StudioDiscovery, StudioDock } from "../components/StudioFamily";

afterEach(cleanup);

it("opens the floating collection, closes on Escape and restores focus and scroll", () => {
  render(<MemoryRouter initialEntries={["/en/nex"]}><AppProvider><StudioDock /></AppProvider></MemoryRouter>);
  const toggle = screen.getByRole("button", { hidden: true, name: "From the studio" });
  expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  const dialog = screen.getByRole("dialog", { hidden: true, name: "The DbsStudio product family" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(document.body.style.overflow).toBe("hidden");
  expect(screen.getByRole("link", { hidden: true, name: /NexaChatAI/ })).toHaveAttribute("href", "/en/nexachatai");
  expect(screen.getByRole("link", { hidden: true, name: "Nex" })).toHaveAttribute("aria-current", "page");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
  expect(document.body.style.overflow).not.toBe("hidden");
});

it("closes the collection when choosing a product and preserves its locale", () => {
  render(<MemoryRouter initialEntries={["/en/nex"]}><AppProvider><StudioDock /></AppProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { hidden: true, name: "From the studio" }));
  fireEvent.click(screen.getByRole("link", { hidden: true, name: /NexaChatAI/ }));
  expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { hidden: true, name: "From the studio" })).toHaveAttribute("aria-expanded", "false");
});

it("keeps the footer compact with links to other products in the same locale", () => {
  render(<MemoryRouter initialEntries={["/en/nex"]}><AppProvider><StudioDiscovery /></AppProvider></MemoryRouter>);
  expect(screen.getByRole("link", { hidden: true, name: "NexaChatAI" })).toHaveAttribute("href", "/en/nexachatai");
  expect(screen.getByRole("link", { hidden: true, name: "Start a project" })).toHaveAttribute("href", "/en/contact");
  expect(screen.queryByRole("link", { hidden: true, name: "Nex" })).not.toBeInTheDocument();
});
