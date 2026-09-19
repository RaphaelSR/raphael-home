export const origin = "https://raphaelrocha.com";
export const metadata = {
  en: {
    title: "Raphael Rocha — Software Engineer & Projects",
    description:
      "Mobile, web and backend engineering by Raphael Rocha. Explore ModPro AI, independent projects, interactive studies and my professional portfolio.",
  },
  pt: {
    title: "Raphael Rocha — Engenheiro de Software e Projetos",
    description:
      "Engenharia mobile, web e backend por Raphael Rocha. Conheça o ModPro AI, projetos independentes, estudos interativos e meu portfólio profissional.",
  },
  es: {
    title: "Raphael Rocha — Ingeniero de Software y Proyectos",
    description:
      "Desarrollo móvil, web y backend por Raphael Rocha. Conoce ModPro AI, proyectos independientes, estudios interactivos y mi portafolio profesional.",
  },
};
export const canonicalUrl = (locale) => `${origin}/home/${locale}/`;
export const socialLocale = { en: "en_US", pt: "pt_BR", es: "es_ES" };
export function structuredData(locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${origin}/#person`,
        name: "Raphael Rocha",
        url: origin + "/",
        jobTitle: "Software Engineer",
        sameAs: [
          "https://github.com/RaphaelSR",
          "https://www.linkedin.com/in/raphael-rocha-903014103/",
          "https://portfolio.raphaelrocha.com/en/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin + "/",
        name: "Raphael Rocha",
        inLanguage: ["en", "pt-BR", "es"],
        author: { "@id": `${origin}/#person` },
      },
      {
        "@type": "WebPage",
        url: canonicalUrl(locale),
        name: metadata[locale].title,
        description: metadata[locale].description,
        inLanguage: locale === "pt" ? "pt-BR" : locale,
        isPartOf: { "@id": `${origin}/#website` },
        about: { "@id": `${origin}/#person` },
      },
    ],
  };
}
export function updateMetadata(locale) {
  const { title, description } = metadata[locale];
  document.title = title;
  for (const [selector, value] of Object.entries({
    'meta[name="description"]': description,
    'meta[property="og:title"]': title,
    'meta[property="og:description"]': description,
    'meta[property="og:url"]': canonicalUrl(locale),
    'meta[property="og:locale"]': socialLocale[locale],
  }))
    document.querySelector(selector)?.setAttribute("content", value);
  document
    .querySelector('link[rel="canonical"]')
    ?.setAttribute("href", canonicalUrl(locale));
  const structured = document.getElementById("structured-data");
  if (structured)
    structured.textContent = JSON.stringify(structuredData(locale));
}
