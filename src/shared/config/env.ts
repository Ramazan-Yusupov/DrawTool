type Environment = ImportMetaEnv & {
  readonly VITE_APP_NAME?: string;
};

const environment = import.meta.env as Environment;

/** Reads a public Vite variable while keeping a deterministic fallback. */
export function getEnv(name: keyof Environment, fallback = "") {
  const value = environment[name];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export const ENV = {
  appName: getEnv("VITE_APP_NAME", "DrawTool"),
  isDevelopment: Boolean(environment.DEV),
  isProduction: Boolean(environment.PROD),
} as const;
