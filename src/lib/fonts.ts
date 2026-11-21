import { Plus_Jakarta_Sans } from "next/font/google";

// One family, variable 400–800 (decision 0007). Shared by the root layout
// and the global not-found page, which renders without a layout.
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});
