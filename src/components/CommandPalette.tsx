import { useCallback, useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Languages, Mail, Moon, Phone, Search, Sun, X } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";

type Cmd = {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
};

/**
 * ⌘K / Ctrl+K command palette — on-brand power-user navigation.
 */
export default function CommandPalette() {
  const { t, toggleLang, toggleTheme, theme, lang } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setActive(0);
  }, []);

  const commands = useMemo<Cmd[]>(() => {
    const go = (to: string, label: string, hint?: string): Cmd => ({
      id: to,
      label,
      hint: hint ?? to,
      run: () => {
        close();
        navigate(to);
      },
    });

    const home = localePath(lang, "/");
    return [
      go(localePath(lang, "/projects"), t.nav.projects),
      go(localePath(lang, "/articles"), t.nav.articles),
      go(`${home}#expertise`, t.nav.expertise),
      go(`${home}#process`, t.nav.process),
      go(localePath(lang, "/about"), t.nav.about),
      go(localePath(lang, "/contact"), t.nav.contact),
      {
        id: "theme",
        label: theme === "dark" ? t.theme.toLight : t.theme.toDark,
        hint: "theme",
        run: () => {
          toggleTheme();
          close();
        },
      },
      {
        id: "lang",
        label: lang === "fa" ? "English" : "فارسی",
        hint: "lang",
        run: () => {
          toggleLang();
          close();
        },
      },
      {
        id: "email",
        label: t.contact.email,
        hint: "mailto",
        run: () => {
          close();
          window.location.href = `mailto:${t.contact.email}`;
        },
      },
      {
        id: "phone",
        label: t.contact.phone,
        hint: "tel",
        run: () => {
          close();
          window.location.href = `tel:${t.contact.phone}`;
        },
      },
    ];
  }, [t, theme, lang, toggleTheme, toggleLang, close, navigate]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(needle) || (c.hint ?? "").includes(needle));
  }, [commands, q]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    setActive(0);
  }, [q, open]);

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    filtered[active]?.run();
  };

  if (!open) return null;

  const listboxId = "command-palette-listbox";
  const optionDomId = (id: string) => `cmd-option-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const activeOption = filtered[active];
  const activeDescendant = activeOption ? optionDomId(activeOption.id) : undefined;

  const icons: Record<string, typeof Search> = {
    theme: theme === "dark" ? Sun : Moon,
    lang: Languages,
    email: Mail,
    phone: Phone,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm" onClick={close} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.command.title}
        className="w-full max-w-lg overflow-hidden rounded-md border border-line bg-page shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-ink3" strokeWidth={2} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={t.command.placeholder}
            className="h-12 w-full bg-transparent text-[14px] font-medium outline-none placeholder:text-ink3"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
          />
          <button type="button" onClick={close} className="rounded-xs p-1.5 text-ink3 hover:text-ink" aria-label={t.command.close}>
            <X className="h-4 w-4" />
          </button>
        </form>

        <ul id={listboxId} className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-[13px] text-ink3">{t.command.empty}</li>
          )}
          {filtered.map((cmd, i) => {
            const Icon = icons[cmd.id] ?? ArrowRight;
            return (
              <li key={cmd.id} id={optionDomId(cmd.id)} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={cmd.run}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-start transition-colors",
                    i === active ? "bg-surface text-hi" : "text-ink hover:bg-surface"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.8} />
                  <span className="flex-1 text-[13.5px] font-semibold">{cmd.label}</span>
                  {cmd.hint && <span className="font-mono text-[10px] text-ink3">{cmd.hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10px] text-ink3">
          <span>{t.command.hint}</span>
          <kbd className="rounded-xs border border-line px-1.5 py-0.5">esc</kbd>
        </div>
      </div>
    </div>
  );
}
