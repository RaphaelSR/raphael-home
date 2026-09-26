import { updateMetadata } from "./seo";
import { useEffect, useState } from "react";
import { languages } from "./i18n";
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences remain usable when storage is unavailable. */
  }
};
export function usePreferences(initialLanguage) {
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");
  useEffect(() => {
    const applyLocation = () => {
      const pathLocale = location.pathname.match(/^\/home\/(en|pt|es)\/$/)?.[1];
      const stored = read("home-language");
      const next =
        pathLocale ||
        (Object.hasOwn(languages, stored)
          ? stored
          : (navigator.languages || [navigator.language])
              .map((l) => l.split("-")[0])
              .find((l) => Object.hasOwn(languages, l)) || "en");
      if (!pathLocale && location.pathname === "/") {
        history.replaceState(
          null,
          "",
          `/home/${next}/${location.search}${location.hash}`,
        );
      }
      setLanguage(next);
    };
    applyLocation();
    const storedTheme = read("home-theme");
    if (["system", "light", "dark"].includes(storedTheme))
      setTheme(storedTheme);
    addEventListener("popstate", applyLocation);
    return () => removeEventListener("popstate", applyLocation);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : language;
    updateMetadata(language);
  }, [language]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const next =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = next;
      setResolvedTheme(next);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return {
    language,
    resolvedTheme,
    changeLanguage: (value) => {
      history.pushState(
        null,
        "",
        `/home/${value}/${location.search}${location.hash}`,
      );
      setLanguage(value);
      save("home-language", value);
    },
    changeTheme: (value) => {
      setTheme(value);
      save("home-theme", value);
    },
  };
}
