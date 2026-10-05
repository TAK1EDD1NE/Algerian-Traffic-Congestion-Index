import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/i18n/locale";

export function Footer() {
  const locale = useLocale();
  const { t } = useTranslation();
  return (
    <footer className="mt-12 border-t border-border bg-card py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 font-bold">{t("nav.brandSub")}</div>
          <p className="max-w-sm text-sm text-muted-foreground">{t("footer.body")}</p>
        </div>
        <div className="flex gap-12">
          <div>
            <div className="label-xs mb-4">{t("footer.dataSource")}</div>
            <div className="text-sm font-medium">{t("footer.dataValue")}</div>
          </div>
          <div>
            <div className="label-xs mb-4">{t("footer.coverage")}</div>
            <div className="text-sm font-medium">{t("footer.coverageValue")}</div>
          </div>
          <div>
            <div className="label-xs mb-4">{t("footer.about")}</div>
            <Link
              to="/$locale/about"
              params={{ locale }}
              className="text-sm font-medium transition-colors hover:text-signal"
            >
              {t("footer.teamSchool")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
