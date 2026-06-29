"use client";

import { Fish, Tent } from "lucide-react";
import { getGearByCategory, type GearCategory } from "@/data/gear";
import GearGrid from "@/components/gear/GearGrid";

const SECTIONS: { key: GearCategory; label: string; Icon: typeof Fish }[] = [
  { key: "fishing", label: "낚시용품", Icon: Fish },
  { key: "camping", label: "캠핑용품", Icon: Tent },
];

export default function GearCatalog() {
  return (
    <>
      <nav className="mt-5 flex gap-2">
        {SECTIONS.map(({ key, label, Icon }) => (
          <a
            key={key}
            href={`#${key}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3.5 py-2 text-sm font-semibold text-forest-700 transition-colors hover:bg-forest-100"
          >
            <Icon size={15} strokeWidth={2.2} />
            {label}
          </a>
        ))}
      </nav>

      {SECTIONS.map(({ key, label, Icon }) => {
        const items = getGearByCategory(key);
        return (
          <section key={key} id={key} className="mt-10 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Icon className="text-forest-600" size={22} strokeWidth={2.2} />
              <h2 className="text-xl font-extrabold text-forest-800">{label}</h2>
              <span className="text-sm font-semibold tabular-nums text-neutral-400">
                {items.length}
              </span>
            </div>
            <div className="mt-4">
              <GearGrid items={items} />
            </div>
          </section>
        );
      })}
    </>
  );
}
