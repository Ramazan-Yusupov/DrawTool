import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { APP_CONFIG, ENV } from "@/shared/config";

/**
 * Application-wide runtime setup kept outside feature pages.
 * It currently owns document metadata and is the single place for future
 * providers (analytics, i18n, query cache) without changing BoardPage.
 */
export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    document.title = ENV.appName || APP_CONFIG.name;
  }, []);

  return children;
}
