import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import {
  metadata,
  origin,
  canonicalUrl,
  structuredData,
  socialLocale,
} from "./seo";
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
export function renderPage(template, locale) {
  const { title, description } = metadata[locale];
  const head = `<title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}">
    <link rel="canonical" href="${canonicalUrl(locale)}">
    ${["en", "pt", "es"].map((lang) => `<link rel="alternate" hreflang="${lang}" href="${canonicalUrl(lang)}">`).join("\n")}
    <link rel="alternate" hreflang="x-default" href="${origin}/">
    <meta property="og:title" content="${escape(title)}">
    <meta property="og:description" content="${escape(description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Raphael Rocha">
    <meta property="og:url" content="${canonicalUrl(locale)}">
    <meta property="og:locale" content="${socialLocale[locale]}">
    <meta property="og:image" content="${origin}/social-card.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Raphael Rocha — Software Engineer">
    <meta name="twitter:card" content="summary_large_image">
    <script id="structured-data" type="application/ld+json">${JSON.stringify(structuredData(locale)).replaceAll("<", "\\u003c")}</script>`;
  return template
    .replace(
      '<html lang="en">',
      `<html lang="${locale === "pt" ? "pt-BR" : locale}" data-locale="${locale}">`,
    )
    .replace("<!-- SEO -->", head)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${renderToString(<App initialLanguage={locale} />)}</div>`,
    );
}
