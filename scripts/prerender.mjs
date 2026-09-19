import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { renderPage } = await server.ssrLoadModule("/src/entry-server.jsx");
  const template = await readFile("dist/index.html", "utf8");
  for (const locale of ["en", "pt", "es"]) {
    await mkdir(`dist/home/${locale}`, { recursive: true });
    await writeFile(
      `dist/home/${locale}/index.html`,
      renderPage(template, locale),
    );
  }
  await writeFile("dist/index.html", renderPage(template, "en"));
} finally {
  await server.close();
}
