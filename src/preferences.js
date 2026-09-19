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
export function usePreferences() {
  const [language, setLanguage] = useState(() => {
    const stored = read("home-language");
    if (Object.hasOwn(languages, stored)) return stored;
    return (
      (navigator.languages || [navigator.language])
        .map((l) => l.split("-")[0])
        .find((l) => Object.hasOwn(languages, l)) || "en"
    );
  });
  const [theme, setTheme] = useState(() => {
    const stored = read("home-theme");
    return ["system", "light", "dark"].includes(stored) ? stored : "system";
  });
  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : language;
    document.title = `Raphael Rocha — ${language === "pt" ? "software e projetos" : language === "es" ? "software y proyectos" : "software and projects"}`;
  }, [language]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return {
    language,
    theme,
    changeLanguage: (value) => {
      setLanguage(value);
      save("home-language", value);
    },
    changeTheme: (value) => {
      setTheme(value);
      save("home-theme", value);
    },
  };
}
