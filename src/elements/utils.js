import { unsafeCSS } from "lit";

export const litStaticStyles = (...stylesheets) =>
  stylesheets.flatMap((stylesheet) => {
    if (!stylesheet) return [];
    if (Array.isArray(stylesheet)) return litStaticStyles(...stylesheet);
    if (typeof stylesheet === "object" && !("cssText" in stylesheet)) {
      return litStaticStyles(...Object.values(stylesheet));
    }
    return [typeof stylesheet === "string" ? unsafeCSS(stylesheet) : stylesheet];
  });