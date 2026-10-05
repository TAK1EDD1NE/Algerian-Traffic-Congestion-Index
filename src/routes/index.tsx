import { createFileRoute, redirect } from "@tanstack/react-router";
import { preferredLocale } from "@/i18n/locale";

/**
 * Bare `/` has no component: it forwards to the preferred locale.
 * On the server there is no localStorage, so the first paint is `/en`; a client-side
 * navigation to `/` can pick a stored preference instead. The redirect happens in
 * beforeLoad, before any render, so there is no hydration mismatch.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$locale", params: { locale: preferredLocale() }, replace: true });
  },
});
