import { withProviders } from "@/app/providers";
import { AppRouter } from "@/app/routes";

export const App = withProviders(AppRouter);
