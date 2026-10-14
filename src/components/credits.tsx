import { useTranslations } from "next-intl";

const linkClass = "text-accentBrand hover:underline";

export function Credits() {
  const t = useTranslations("Credits");

  return (
    <section className="mx-auto max-w-[600px] pb-20 sm:pb-0">
      <div className="text-center">
        {t.rich("text", {
          magic: (chunks) => (
            <a href="https://magicui.design/" className={linkClass}>
              {chunks}
            </a>
          ),
          dillion: (chunks) => (
            <a href="https://github.com/dillionverma" className={linkClass}>
              {chunks}
            </a>
          ),
        })}
      </div>
    </section>
  );
}
