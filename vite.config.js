import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { input: { main: "index.html", admin: "admin/index.html" } },
  },
  plugins: [
    {
      name: "production-content-policy",
      apply: "build",
      transformIndexHtml(html, context) {
        const admin = context.filename.endsWith("/admin/index.html");
        return [
          {
            tag: "meta",
            attrs: {
              "http-equiv": "Content-Security-Policy",
              content: admin
                ? "default-src 'self'; script-src 'self' https://accounts.google.com/gsi/client; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; img-src 'self' data:; font-src 'self'; connect-src https://accounts.google.com/gsi/ https://openidconnect.googleapis.com https://analyticsdata.googleapis.com; frame-src https://accounts.google.com/gsi/; object-src 'none'; base-uri 'none'; form-action 'none'"
                : "default-src 'self'; script-src 'self' https://raphaelrocha.com/analytics.js https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://raphaelrocha.com/analytics.css; img-src 'self' data: https://www.google-analytics.com; font-src 'self'; connect-src https://www.google-analytics.com https://region1.google-analytics.com; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
            },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  ],
});
