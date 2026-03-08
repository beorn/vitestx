import { defineConfig } from "vitepress"

export default defineConfig({
  title: "vitestx",
  description: "Fuzz testing, chaos streams, and a streaming reporter for Vitest.",
  base: "/vitestx/",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/vitestx/favicon.svg" }]],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/fuzz-api" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Fuzz Testing", link: "/guide/fuzz-testing" },
          { text: "Chaos Streams", link: "/guide/chaos-streams" },
          { text: "Dotz Reporter", link: "/guide/dotz-reporter" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Fuzz API", link: "/reference/fuzz-api" },
          { text: "Chaos API", link: "/reference/chaos-api" },
          { text: "Dotz API", link: "/reference/dotz-api" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/beorn/vitestx" }],
    footer: { message: "Released under the MIT License." },
    search: { provider: "local" },
  },
})
