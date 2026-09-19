import React, { useEffect, useState } from "react";
import { languages, messages } from "./i18n";
import { usePreferences } from "./preferences";
const projects = [
  {
    id: "geometry",
    name: "Geometry",
    type: "tool",
    host: "3d.raphaelrocha.com",
  },
  {
    id: "trivia",
    name: "Trivia",
    type: "game",
    host: "trivia.raphaelrocha.com",
  },
  {
    id: "mimica",
    name: "Mímica",
    type: "game",
    host: "mimica.raphaelrocha.com",
  },
  { id: "snake", name: "Snake", type: "game", host: "snake.raphaelrocha.com" },
  {
    id: "flybrain",
    name: "Fly Brain Bench",
    type: "study",
    host: "flybrain.raphaelrocha.com",
  },
];
const Arrow = () => <span aria-hidden="true">↗</span>;
function useHeader() {
  const [state, setState] = useState({
    compact: false,
    section: "main",
    progress: 0,
  });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      const projects = document.getElementById("projects");
      const contact = document.getElementById("contact");
      const section =
        contact && contact.getBoundingClientRect().top < innerHeight * 0.85
          ? "contact"
          : projects && projects.getBoundingClientRect().top < 160
            ? "projects"
            : "main";
      setState({ compact: scrollY > 60, section, progress });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return state;
}
function Header({
  language,
  theme,
  changeLanguage,
  changeTheme,
  t,
  portfolio,
}) {
  const header = useHeader();
  return (
    <header className={`header ${header.compact ? "is-compact" : ""}`}>
      <div className="header-inner">
        <a className="name home-mark" href="#main" aria-label={t.home}>
          <span aria-hidden="true">r.</span>
        </a>
        <nav aria-label={t.navigation}>
          <a
            href="#projects"
            aria-current={
              header.section === "projects" ? "location" : undefined
            }
          >
            {t.projects}
          </a>
          <a href={portfolio}>
            {t.portfolio} <Arrow />
          </a>
          <a
            href="#contact"
            aria-current={header.section === "contact" ? "location" : undefined}
          >
            {t.contact}
          </a>
        </nav>
        <div className="preferences">
          <label>
            <span className="sr-only">{t.language}</span>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              {Object.entries(languages).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t.theme}</span>
            <select value={theme} onChange={(e) => changeTheme(e.target.value)}>
              <option value="system">◐ {t.system}</option>
              <option value="light">☀ {t.light}</option>
              <option value="dark">☾ {t.dark}</option>
            </select>
          </label>
        </div>
        <span
          className="scroll-progress"
          aria-hidden="true"
          style={{ transform: `scaleX(${header.progress})` }}
        />
      </div>
    </header>
  );
}
export default function App({ initialLanguage = "en" }) {
  const { language, theme, changeLanguage, changeTheme } =
    usePreferences(initialLanguage);
  const t = messages[language];
  const [copyStatus, setCopyStatus] = useState(null);
  const portfolio = `https://portfolio.raphaelrocha.com/${language}/`;
  async function copyDiscord() {
    try {
      await navigator.clipboard.writeText("raphaelsr");
      setCopyStatus("copied");
    } catch {
      setCopyStatus("copyFailed");
    }
  }
  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <Header
        language={language}
        theme={theme}
        changeLanguage={changeLanguage}
        changeTheme={changeTheme}
        t={t}
        portfolio={portfolio}
      />
      <main id="main" tabIndex={-1}>
        <section className="intro" aria-labelledby="intro-title">
          <p className="kicker">SOFTWARE ENGINEER</p>
          <h1 id="intro-title">Raphael Rocha.</h1>
          <p className="lead">{t.lead}</p>
          <p className="summary">{t.summary}</p>
          <a className="text-link" href={portfolio}>
            {t.work} <span aria-hidden="true">›</span>
          </a>
        </section>
        <section className="current-work" aria-labelledby="current-work-title">
          <div className="current-work-heading">
            <p className="kicker">{t.currentWork}</p>
            <h2 id="current-work-title">
              <a href="https://modpro.ai/">
                ModPro AI <Arrow />
              </a>
            </h2>
          </div>
          <div className="current-work-copy">
            <p>{t.currentDescription}</p>
            <p>{t.currentContribution}</p>
            <nav className="current-work-links" aria-label={t.currentLinks}>
              <a href="https://app.modpro.ai/">
                {t.openWeb} <Arrow />
              </a>
              <a href="https://apps.apple.com/us/app/modpro-ai/id6755011876">
                App Store <Arrow />
              </a>
              <a href="https://play.google.com/store/apps/details?id=ai.modpro.app">
                Google Play <Arrow />
              </a>
            </nav>
          </div>
        </section>
        <section
          id="projects"
          className="projects"
          aria-labelledby="projects-title"
        >
          <div className="section-heading">
            <h2 id="projects-title">{t.personalProjects}</h2>
            <p>{t.available}</p>
          </div>
          <div className="project-list">
            {projects.map((p, i) => (
              <a className="project" href={`https://${p.host}/`} key={p.id}>
                <span className="project-number">0{i + 1}</span>
                <div className="project-copy">
                  <div className="project-title">
                    <h3>{p.name}</h3>
                    <span className="type">{t[p.type]}</span>
                  </div>
                  <p>{t.descriptions[p.id]}</p>
                  <span className="mobile-host">{p.host}</span>
                </div>
                <span className="host">{p.host}</span>
                <span className="project-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>
        <section className="portfolio" aria-labelledby="portfolio-title">
          <div>
            <h2 id="portfolio-title">{t.behind}</h2>
            <p>{t.experience}</p>
          </div>
          <a className="text-link" href={portfolio}>
            {t.visit} <span aria-hidden="true">›</span>
          </a>
        </section>
      </main>
      <footer id="contact">
        <a className="back-top" href="#main">
          {t.backTop} <span aria-hidden="true">↑</span>
        </a>
        <nav aria-label={t.contacts}>
          <a href="https://github.com/RaphaelSR">
            GitHub <Arrow />
          </a>
          <a href="https://www.linkedin.com/in/raphael-rocha-903014103/">
            LinkedIn <Arrow />
          </a>
          <a href="mailto:raphaelrochabcc@gmail.com">
            {t.email} <Arrow />
          </a>
          <a href="https://wa.me/541127252431">
            WhatsApp <Arrow />
          </a>
          <button className="discord" onClick={copyDiscord} aria-label={t.copy}>
            Discord <span>raphaelsr</span>
            <span aria-hidden="true">⧉</span>
          </button>
        </nav>
        <nav aria-label={t.language} className="locale-links">
          {Object.entries(languages).map(([locale, label]) => (
            <a
              key={locale}
              href={`https://raphaelrocha.com/home/${locale}/`}
              hrefLang={locale}
              lang={locale}
              aria-current={language === locale ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="copy-status" role="status">
          {copyStatus ? t[copyStatus] : ""}
        </p>
      </footer>
    </>
  );
}
