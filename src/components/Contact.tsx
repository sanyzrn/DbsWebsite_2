import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import { useApp } from "../lib/app";
import { cn } from "../utils/cn";
import { Reveal } from "./ui";

type Fields = { name: string; email: string; company: string; type: string; message: string; budget: string; timeline: string };
type Status = "idle" | "sending" | "delivered" | "mailed" | "error";

const empty: Fields = { name: "", email: "", company: "", type: "", message: "", budget: "", timeline: "" };
const MAILTO_SAFE = 1800;

function buildMailto(fields: Fields): string {
  const subject = encodeURIComponent(`Project inquiry — ${fields.type} — ${fields.name}`);
  const header = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.company.trim() ? `Company: ${fields.company}` : "",
    `Project type: ${fields.type}`,
    fields.budget.trim() ? `Budget: ${fields.budget}` : "",
    fields.timeline.trim() ? `Timeline: ${fields.timeline}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  let message = fields.message.trim();
  let body = `${header}\n\n${message}`;
  // Keep under practical mailto length limits across clients/OS.
  while (encodeURIComponent(body).length > MAILTO_SAFE && message.length > 40) {
    message = `${message.slice(0, Math.floor(message.length * 0.85))}…`;
    body = `${header}\n\n${message}`;
  }
  return `mailto:zrn_sany@yahoo.com?subject=${subject}&body=${encodeURIComponent(body)}`;
}

export default function Contact() {
  const { t } = useApp();
  const f = t.contact.form;
  const [fields, setFields] = useState<Fields>({ ...empty, type: f.types[0] });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const set = (key: keyof Fields, value: string) => {
    setFields((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof Fields, boolean>> = {
      name: !fields.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email),
      message: !fields.message.trim(),
    };
    setErrors(next);
    if (next.name || next.email || next.message) return;

    const formspreeId = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

    if (formspreeId) {
      setStatus("sending");
      try {
        const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fields.name,
            email: fields.email,
            company: fields.company,
            type: fields.type,
            message: fields.message,
            budget: fields.budget,
            timeline: fields.timeline,
            _subject: `Project inquiry — ${fields.type} — ${fields.name}`,
          }),
        });
        if (!res.ok) throw new Error("formspree failed");
        setStatus("delivered");
        setFields({ ...empty, type: f.types[0] });
      } catch {
        setStatus("error");
      }
      return;
    }

    // Honest mailto fallback — do not claim the message was delivered.
    window.location.href = buildMailto(fields);
    setStatus("mailed");
  };

  const info = [
    { icon: Mail, label: t.contact.emailLabel, value: t.contact.email, href: `mailto:${t.contact.email}`, ltr: true },
    { icon: Phone, label: t.contact.phoneLabel, value: t.contact.phone, href: `tel:${t.contact.phone}`, ltr: true },
    { icon: MapPin, label: t.contact.locationLabel, value: t.contact.location },
    { icon: Clock3, label: t.contact.responseLabel, value: t.contact.response },
  ];

  return (
    <section id="contact" className="section-pad border-t border-line bg-surface">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="kicker">{t.contact.kicker}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-[38px] font-black leading-[1.15] tracking-tight md:text-[52px]">{t.contact.title}</h2>
            </Reveal>
            <div className="mt-8 space-y-4">
              {t.contact.lines.map((line, i) => (
                <Reveal key={i} delay={160 + i * 90}>
                  <p className="flex items-start gap-3.5 text-[15px] font-medium leading-8 text-ink2">
                    <span className="mt-4 h-px w-7 shrink-0 bg-hi" aria-hidden="true" />
                    {line}
                  </p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={460}>
              <p className="mt-8 text-[17px] font-extrabold leading-8 tracking-tight md:text-[19px]">{t.contact.strong}</p>
            </Reveal>

            <Reveal delay={540}>
              <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                {info.map((item) => (
                  <div key={item.label} className="mb-5 sm:mb-0">
                    <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-sm border border-line text-hi">
                      <item.icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="text-[11px] font-semibold text-ink3">{item.label}</div>
                    <div className="mt-1 text-[13px] font-bold" dir={item.ltr ? "ltr" : undefined}>
                      {item.href ? (
                        <a href={item.href} className="transition-colors hover:text-hi">
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={200}>
              <form onSubmit={submit} noValidate className="rounded-lg border border-line bg-page p-7 md:p-9">
                <div className="mb-8 border-b border-line pb-6">
                  <h3 className="text-[20px] font-extrabold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-7 text-ink2">{f.desc}</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ct-name" className="mb-2 block text-[12.5px] font-bold text-ink2">
                      {f.name} <span className="text-hi">*</span>
                    </label>
                    <input
                      id="ct-name"
                      className={cn("field", errors.name && "border-[#C2603E]!")}
                      placeholder={f.namePh}
                      value={fields.name}
                      onChange={(e) => set("name", e.target.value)}
                      autoComplete="name"
                    />
                    {errors.name && <p className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">{f.required}</p>}
                  </div>
                  <div>
                    <label htmlFor="ct-email" className="mb-2 block text-[12.5px] font-bold text-ink2">
                      {f.email} <span className="text-hi">*</span>
                    </label>
                    <input
                      id="ct-email"
                      type="email"
                      dir="ltr"
                      className={cn("field text-start", errors.email && "border-[#C2603E]!")}
                      placeholder={f.emailPh}
                      value={fields.email}
                      onChange={(e) => set("email", e.target.value)}
                      autoComplete="email"
                    />
                    {errors.email && <p className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">{f.required}</p>}
                  </div>
                  <div>
                    <label htmlFor="ct-company" className="mb-2 block text-[12.5px] font-bold text-ink2">
                      {f.company}
                    </label>
                    <input
                      id="ct-company"
                      className="field"
                      placeholder={f.companyPh}
                      value={fields.company}
                      onChange={(e) => set("company", e.target.value)}
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-type" className="mb-2 block text-[12.5px] font-bold text-ink2">
                      {f.type}
                    </label>
                    <div className="relative">
                      <select id="ct-type" className="field" value={fields.type} onChange={(e) => set("type", e.target.value)}>
                        {f.types.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink3" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="ct-message" className="mb-2 block text-[12.5px] font-bold text-ink2">
                      {f.message} <span className="text-hi">*</span>
                    </label>
                    <textarea
                      id="ct-message"
                      className={cn("field", errors.message && "border-[#C2603E]!")}
                      placeholder={f.messagePh}
                      value={fields.message}
                      onChange={(e) => set("message", e.target.value)}
                    />
                    {errors.message && <p className="mt-1.5 text-[11.5px] font-semibold text-[#C2603E]">{f.required}</p>}
                  </div>
                  <div>
                    <label htmlFor="ct-budget" className="mb-2 block text-[12.5px] font-bold text-ink2">
                      {f.budget}
                    </label>
                    <input
                      id="ct-budget"
                      className="field"
                      placeholder={f.budgetPh}
                      value={fields.budget}
                      onChange={(e) => set("budget", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-timeline" className="mb-2 block text-[12.5px] font-bold text-ink2">
                      {f.timeline}
                    </label>
                    <input
                      id="ct-timeline"
                      className="field"
                      placeholder={f.timelinePh}
                      value={fields.timeline}
                      onChange={(e) => set("timeline", e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary mt-8 w-full" disabled={status === "sending"}>
                  {status === "sending" ? f.sending : f.submit}
                  <Send className="h-4 w-4 rtl:-scale-x-100" strokeWidth={2.2} />
                </button>

                <p className="mt-4 text-center text-[12px] text-ink3">
                  {f.directEmail}{" "}
                  <a href={`mailto:${t.contact.email}`} dir="ltr" className="font-bold text-hi hover:underline">
                    {t.contact.email}
                  </a>
                </p>

                {status === "delivered" && (
                  <div className="mt-5 flex items-start gap-3 rounded-sm border border-sage/40 bg-sage/10 px-4 py-3.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                    <div>
                      <p className="text-[13.5px] font-bold text-ink">{f.deliveredTitle}</p>
                      <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.deliveredBody}</p>
                    </div>
                  </div>
                )}

                {status === "mailed" && (
                  <div className="mt-5 flex items-start gap-3 rounded-sm border border-line bg-surface px-4 py-3.5">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-hi" />
                    <div>
                      <p className="text-[13.5px] font-bold text-ink">{f.mailedTitle}</p>
                      <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.mailedBody}</p>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="mt-5 flex items-start gap-3 rounded-sm border border-[#C2603E]/40 bg-[#C2603E]/10 px-4 py-3.5">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C2603E]" />
                    <div>
                      <p className="text-[13.5px] font-bold text-ink">{f.errorTitle}</p>
                      <p className="mt-1 text-[12.5px] leading-6 text-ink2">{f.errorBody}</p>
                    </div>
                  </div>
                )}
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
