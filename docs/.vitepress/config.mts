import { defineConfig } from "vitepress";
import generateSidebar from "./sidebar.mts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog/",
  title: "信长笔记2.0",
  description: "信长笔记2.0",
  srcDir: "./信长笔记2.0",
  themeConfig: {
    logo: "/avatar.jpg",
    search: {
      provider: "local",
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "关于我", link: "/关于我" },
    ],
    sidebar: generateSidebar(),
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2019-present Evan You",
    },
    // i18nRouting: true
  },
});
