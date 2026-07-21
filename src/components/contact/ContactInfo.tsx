import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useApp } from "../../lib/app";

export function ContactInfo() {
  const { t } = useApp();
  const info = [
    { icon: Mail, label: t.contact.emailLabel, value: t.contact.email, href: `mailto:${t.contact.email}`, ltr: true },
    { icon: Phone, label: t.contact.phoneLabel, value: t.contact.phone, href: `tel:${t.contact.phone}`, ltr: true },
    { icon: MapPin, label: t.contact.locationLabel, value: t.contact.location },
    { icon: Clock3, label: t.contact.responseLabel, value: t.contact.response },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-6 sm:mt-10 sm:gap-x-6 sm:gap-y-5 sm:pt-8 lg:grid-cols-4 lg:gap-8 lg:pt-10">
      {info.map((item) => (
        <div key={item.label} className="flex min-w-0 items-start gap-2.5 sm:gap-3.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line text-hi sm:h-9 sm:w-9">
            <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-ink3 sm:text-[11px]">{item.label}</div>
            <div className="mt-0.5 truncate text-[12.5px] font-bold sm:mt-1 sm:text-[13.5px]" dir={item.ltr ? "ltr" : undefined}>
              {item.href ? (
                <a href={item.href} className="transition-colors hover:text-hi">
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
