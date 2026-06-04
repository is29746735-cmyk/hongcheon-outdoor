import { SITE } from "@/constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500">
        <p className="font-semibold text-neutral-700">{SITE.name}</p>
        <p className="mt-1">{SITE.description}</p>
        <p className="mt-4">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
