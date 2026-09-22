(() => {
  "use strict";
  const hosts = new Set([
    "raphaelrocha.com",
    "portfolio.raphaelrocha.com",
    "3d.raphaelrocha.com",
    "trivia.raphaelrocha.com",
    "mimica.raphaelrocha.com",
    "snake.raphaelrocha.com",
    "flybrain.raphaelrocha.com",
    "basilica.raphaelrocha.com",
  ]);
  if (
    !hosts.has(location.hostname) ||
    /^\/admin(?:\/|$)/.test(location.pathname) ||
    window.rrAnalytics
  )
    return;
  const id = "G-9F41PKY1G5";
  const cookieName = "rr_analytics_consent";
  const disabled = `ga-disable-${id}`;
  const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
  const compactSites = {
    "3d.raphaelrocha.com": "geometry",
    "trivia.raphaelrocha.com": "trivia",
    "mimica.raphaelrocha.com": "mimica",
    "snake.raphaelrocha.com": "snake",
    "flybrain.raphaelrocha.com": "flybrain",
  };
  const texts = {
    pt: {
      title: "Privacidade",
      body: "Posso usar cookies do Google Analytics para entender as visitas aos meus projetos? A escolha vale para este site e seus subdomínios. Não usamos publicidade. Você pode mudar de ideia a qualquer momento.",
      yes: "Permitir",
      no: "Recusar",
      settings: "Privacidade e cookies",
      details: "Saiba mais",
    },
    en: {
      title: "Privacy",
      body: "May I use Google Analytics cookies to understand visits to my projects? Your choice applies to this site and its subdomains. We do not use advertising. You can change your choice at any time.",
      yes: "Allow",
      no: "Decline",
      settings: "Privacy and cookies",
      details: "Learn more",
    },
    es: {
      title: "Privacidad",
      body: "¿Puedo usar cookies de Google Analytics para entender las visitas a mis proyectos? Tu elección se aplica a este sitio y sus subdominios. No usamos publicidad. Puedes cambiar de opinión cuando quieras.",
      yes: "Permitir",
      no: "Rechazar",
      settings: "Privacidad y cookies",
      details: "Más información",
    },
  };
  const consent = () =>
    document.cookie
      .split("; ")
      .find((v) => v.startsWith(`${cookieName}=`))
      ?.split("=")[1];
  let loaded = false;
  let lastPage = "";
  let banner;
  let opener;
  let flyBoot;
  function gtag() {
    window.dataLayer.push(arguments);
  }
  const cleanReferrer = () => {
    try {
      return new URL(document.referrer).origin;
    } catch {
      return "";
    }
  };
  const safePage = () =>
    location.origin +
    (/^\/(?:home\/)?(?:pt|en|es)\/$/.test(location.pathname)
      ? location.pathname
      : "/");
  const page = () => {
    if (
      consent() !== "yes" ||
      dnt ||
      !loaded ||
      /^\/admin(?:\/|$)/.test(location.pathname)
    )
      return;
    const url = safePage();
    if (url === lastPage) return;
    lastPage = url;
    gtag("set", {
      page_location: url,
      page_referrer: cleanReferrer(),
      page_title: location.hostname,
    });
    gtag("event", "page_view", {
      send_to: id,
      page_location: url,
      page_referrer: cleanReferrer(),
      page_title: location.hostname,
    });
  };
  const start = () => {
    if (dnt || consent() !== "yes") return;
    window[disabled] = false;
    if (!loaded) {
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      gtag("js", new Date());
      gtag("config", id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_domain: "raphaelrocha.com",
        cookie_expires: 15552000,
        cookie_flags: "SameSite=Lax;Secure",
        page_location: safePage(),
        page_referrer: cleanReferrer(),
        page_title: location.hostname,
      });
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      script.async = true;
      document.head.append(script);
    }
    page();
  };
  const stop = () => {
    window[disabled] = true;
    lastPage = "";
    for (const pair of document.cookie.split("; ")) {
      const name = pair.split("=")[0];
      if (name === "_ga" || name.startsWith("_ga_")) {
        for (const domain of [
          "",
          ";Domain=raphaelrocha.com",
          `;Domain=${location.hostname}`,
        ])
          document.cookie = `${name}=;Max-Age=0;Path=/${domain};Secure;SameSite=Lax`;
      }
    }
  };
  const choose = (value) => {
    document.cookie = `${cookieName}=${value};Max-Age=15552000;Domain=raphaelrocha.com;Path=/;SameSite=Lax;Secure`;
    banner?.remove();
    if (value === "yes") start();
    else stop();
    opener?.focus({ preventScroll: true });
  };
  const show = () => {
    if (banner?.isConnected) return;
    const language = (
      document.documentElement.lang || navigator.language
    ).slice(0, 2);
    const text = texts[language] || texts.en;
    banner = document.createElement("section");
    banner.className = "rr-consent";
    banner.setAttribute("aria-label", text.title);
    const title = document.createElement("strong");
    title.textContent = text.title;
    const body = document.createElement("p");
    body.textContent = text.body;
    const link = document.createElement("a");
    link.href = "https://raphaelrocha.com/privacy/";
    link.textContent = text.details;
    const actions = document.createElement("div");
    for (const [value, label] of [
      ["no", text.no],
      ["yes", text.yes],
    ]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.onclick = () => choose(value);
      actions.append(button);
    }
    banner.append(title, body, link, actions);
    (flyBoot && !flyBoot.hidden ? flyBoot : document.body).append(banner);
  };
  const init = () => {
    flyBoot =
      location.hostname === "flybrain.raphaelrocha.com"
        ? document.querySelector("#boot")
        : null;
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "https://raphaelrocha.com/analytics.css?v=2";
    document.head.append(style);
    opener = document.createElement("button");
    opener.type = "button";
    opener.className = "rr-privacy";
    const compactSite = compactSites[location.hostname];
    if (compactSite) {
      opener.classList.add("rr-privacy--compact", `rr-privacy--${compactSite}`);
      const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML =
        '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="14.5" cy="10.5" r="1" fill="currentColor"/><circle cx="11.5" cy="15.5" r="1" fill="currentColor"/>';
      opener.append(icon);
    } else if (
      !["raphaelrocha.com", "portfolio.raphaelrocha.com"].includes(
        location.hostname,
      )
    ) {
      opener.classList.add("rr-privacy--floating");
    }
    const settings = (
      texts[
        (document.documentElement.lang || navigator.language).slice(0, 2)
      ] || texts.en
    ).settings;
    if (compactSite) {
      opener.setAttribute("aria-label", settings);
      opener.title = settings;
    } else opener.textContent = settings;
    opener.onclick = show;
    (flyBoot || document.body).append(opener);
    if (flyBoot) {
      const observer = new MutationObserver(() => {
        if (!flyBoot.hidden) return;
        document.body.append(opener);
        if (banner?.isConnected) document.body.append(banner);
        observer.disconnect();
      });
      observer.observe(flyBoot, {
        attributes: true,
        attributeFilter: ["hidden"],
      });
    }
    if (consent() === "yes" && !dnt) start();
    else {
      stop();
      if (!consent() && !dnt) show();
    }
  };
  window.rrAnalytics = { openPrivacy: show };
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      queueMicrotask(page);
      return result;
    };
  }
  addEventListener("popstate", page);
  addEventListener("focus", () => {
    if (consent() === "yes" && !dnt) start();
    else stop();
  });
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
