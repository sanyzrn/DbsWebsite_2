import { useApp } from "../../lib/app";

export function ContactInfo() {
  const { t } = useApp();
  const info = [
    { label: t.contact.emailLabel, value: t.contact.email, href: `mailto:${t.contact.email}`, ltr: true },
    { label: t.contact.phoneLabel, value: t.contact.phone, href: `tel:${t.contact.phone}`, ltr: true },
    { label: t.contact.locationLabel, value: t.contact.location },
    { label: t.contact.responseLabel, value: t.contact.response },
  ];

  return (
    <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-ink pt-8 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
      {info.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="meta">{item.label}</dt>
          <dd className="mt-1.5 truncate text-[16px] font-semibold">
            {item.href ? (
              <a href={item.href} dir={item.ltr ? "ltr" : undefined} className="link-quiet">
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
