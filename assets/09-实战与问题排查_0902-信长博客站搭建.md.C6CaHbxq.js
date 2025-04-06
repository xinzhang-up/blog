import{_ as n,c as a,o as p,ag as e}from"./chunks/framework.CP8pidWN.js";const l="/blog/assets/1743941538713.CNIqZUJn.png",i="/blog/assets/1743942181149.DYkBI4EC.png",t="/blog/assets/1743942191100.BYSJzNVh.png",c="/blog/assets/1743942256421.B3h_h8MX.png",o="/blog/assets/1743941368209.ChlfiFyH.png",v=JSON.parse('{"title":"信长博客站搭建","description":"","frontmatter":{},"headers":[],"relativePath":"09-实战与问题排查/0902-信长博客站搭建.md","filePath":"09-实战与问题排查/0902-信长博客站搭建.md"}'),r={name:"09-实战与问题排查/0902-信长博客站搭建.md"};function u(d,s,m,h,q,g){return p(),a("div",null,s[0]||(s[0]=[e('<h1 id="信长博客站搭建" tabindex="-1">信长博客站搭建 <a class="header-anchor" href="#信长博客站搭建" aria-label="Permalink to &quot;信长博客站搭建&quot;">​</a></h1><h2 id="使用vitepress建站" tabindex="-1">使用VitePress建站 <a class="header-anchor" href="#使用vitepress建站" aria-label="Permalink to &quot;使用VitePress建站&quot;">​</a></h2><blockquote><p>官方: <a href="https://vitepress.dev/zh/" target="_blank" rel="noreferrer">https://vitepress.dev/zh/</a></p><p>主流程参考: <a href="https://mp.weixin.qq.com/s/R8lmyQj0zwXxYr5ydlRbPw" target="_blank" rel="noreferrer">https://mp.weixin.qq.com/s/R8lmyQj0zwXxYr5ydlRbPw</a></p></blockquote><p>先参考官方文档搭建工程, 本地把页面跑起来, 我的工程结构如下</p><p><img src="'+l+`" alt="1743941538713"></p><h3 id="index-md" tabindex="-1">index.md <a class="header-anchor" href="#index-md" aria-label="Permalink to &quot;index.md&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>---</span></span>
<span class="line"><span># https://vitepress.dev/reference/default-theme-home-page</span></span>
<span class="line"><span>layout: home</span></span>
<span class="line"><span>lastUpdated: true</span></span>
<span class="line"><span>hero:</span></span>
<span class="line"><span>  name: &quot;信长笔记2.0&quot;</span></span>
<span class="line"><span>  text: &quot;只要开始追赶，就在赢的路上！&quot;</span></span>
<span class="line"><span>  tagline: 源于热爱、勇气与真诚</span></span>
<span class="line"><span>  image:</span></span>
<span class="line"><span>      # 首页右边的图片</span></span>
<span class="line"><span>      src: /avatar.jpg</span></span>
<span class="line"><span>      # 图片的描述</span></span>
<span class="line"><span>      alt: avatar</span></span>
<span class="line"><span>  actions:</span></span>
<span class="line"><span>    - theme: brand</span></span>
<span class="line"><span>      text: 进入主页</span></span>
<span class="line"><span>      link: /介绍</span></span>
<span class="line"><span>    - theme: alt</span></span>
<span class="line"><span>      text: 关于我</span></span>
<span class="line"><span>      link: /关于我</span></span>
<span class="line"><span></span></span>
<span class="line"><span>features: </span></span>
<span class="line"><span>  - title: 热爱</span></span>
<span class="line"><span>    details: 学习和创造是件有趣的事</span></span>
<span class="line"><span>  - title: 勇气</span></span>
<span class="line"><span>    details: 敢于露怯，也敢于突破</span></span>
<span class="line"><span>  - title: 真诚</span></span>
<span class="line"><span>    details: 诚以待己，诚以待人</span></span>
<span class="line"><span>---</span></span></code></pre></div><h3 id="config-mts" tabindex="-1">config.mts <a class="header-anchor" href="#config-mts" aria-label="Permalink to &quot;config.mts&quot;">​</a></h3><ul><li>我将根目录调整为了&quot;./信长笔记2.0&quot;, 因此index.md, 头像等文件都是在该目录下的</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { defineConfig } from &quot;vitepress&quot;;</span></span>
<span class="line"><span>import generateSidebar from &quot;./sidebar.mts&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// https://vitepress.dev/reference/site-config</span></span>
<span class="line"><span>export default defineConfig({</span></span>
<span class="line"><span>  title: &quot;信长笔记2.0&quot;,</span></span>
<span class="line"><span>  description: &quot;信长笔记2.0&quot;,</span></span>
<span class="line"><span>  srcDir: &quot;./信长笔记2.0&quot;,</span></span>
<span class="line"><span>  themeConfig: {</span></span>
<span class="line"><span>    logo: &quot;/avatar.jpg&quot;,</span></span>
<span class="line"><span>    search: {</span></span>
<span class="line"><span>      provider: &quot;local&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    nav: [</span></span>
<span class="line"><span>      { text: &quot;首页&quot;, link: &quot;/&quot; },</span></span>
<span class="line"><span>      { text: &quot;关于我&quot;, link: &quot;/关于我&quot; },</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>    sidebar: generateSidebar(),</span></span>
<span class="line"><span>    socialLinks: [</span></span>
<span class="line"><span>      { icon: &quot;github&quot;, link: &quot;https://github.com/vuejs/vitepress&quot; },</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>    footer: {</span></span>
<span class="line"><span>      message: &quot;Released under the MIT License.&quot;,</span></span>
<span class="line"><span>      copyright: &quot;Copyright © 2019-present Evan You&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    // i18nRouting: true,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span></code></pre></div><h3 id="sidebar-mts" tabindex="-1">sidebar.mts <a class="header-anchor" href="#sidebar-mts" aria-label="Permalink to &quot;sidebar.mts&quot;">​</a></h3><ul><li>自动生成侧边导航栏的脚本</li><li>注意.mts文件是使用 <strong>ECMAScript Modules (ESM)</strong> 语法的 TypeScript 文件, 运行.mts文件需要执行 <code>npm install typescript ts-node @types/node --save-dev</code></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import * as fs from &quot;fs&quot;;</span></span>
<span class="line"><span>import * as path from &quot;path&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const rootDir = path.join(__dirname, &quot;../信长笔记2.0&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function getDirDisplayName(dirName: string): string {</span></span>
<span class="line"><span>  const parts = dirName.split(&quot;-&quot;);</span></span>
<span class="line"><span>  return parts.slice(1).join(&quot;-&quot;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function buildSidebar(dirPath: string): any[] {</span></span>
<span class="line"><span>  const items: any[] = [];</span></span>
<span class="line"><span>  const entries = fs.readdirSync(dirPath, { withFileTypes: true });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  for (const entry of entries) {</span></span>
<span class="line"><span>    if (entry.name === &quot;image&quot;||entry.name === &quot;public&quot;) continue;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const fullPath = path.join(dirPath, entry.name);</span></span>
<span class="line"><span>    const relativePath = path.relative(rootDir, fullPath);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (entry.isDirectory()) {</span></span>
<span class="line"><span>      const subdirItems = buildSidebar(fullPath);</span></span>
<span class="line"><span>      if (subdirItems.length &gt; 0) {</span></span>
<span class="line"><span>        const dirName = path.basename(fullPath);</span></span>
<span class="line"><span>        items.push({</span></span>
<span class="line"><span>          text: getDirDisplayName(dirName),</span></span>
<span class="line"><span>          collapsed:true,</span></span>
<span class="line"><span>          items: subdirItems,</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } else if (entry.isFile() &amp;&amp; path.extname(entry.name) === &quot;.md&quot;) {</span></span>
<span class="line"><span>      const fileName = path.basename(entry.name, &quot;.md&quot;);</span></span>
<span class="line"><span>      items.push({</span></span>
<span class="line"><span>        text: getDirDisplayName(fileName),</span></span>
<span class="line"><span>        link: \`/\${relativePath.replace(/\\\\/g, &quot;/&quot;).replace(/\\.md$/, &quot;&quot;)}\`,</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return items;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export default function generateSidebar() {</span></span>
<span class="line"><span>  const dirs = fs</span></span>
<span class="line"><span>    .readdirSync(rootDir, { withFileTypes: true })</span></span>
<span class="line"><span>    .filter((e) =&gt; e.isDirectory() &amp;&amp; e.name !== &quot;image&quot;)</span></span>
<span class="line"><span>    .map((e) =&gt; e.name);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const sidebar = dirs.map((dir) =&gt; ({</span></span>
<span class="line"><span>    text: getDirDisplayName(dir),</span></span>
<span class="line"><span>    items: buildSidebar(path.join(rootDir, dir)),</span></span>
<span class="line"><span>  }));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // console.log(JSON.stringify(sidebar, null, 2));</span></span>
<span class="line"><span>  return sidebar</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>generateSidebar();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// [prmopt留存]</span></span>
<span class="line"><span>// 现有以下文件</span></span>
<span class="line"><span>// - &quot;docs/信长笔记2.0/02-Java语言基础/0201-Java核心知识点/020101-Java语言基础.md&quot;,</span></span>
<span class="line"><span>// - &quot;docs/信长笔记2.0/02-Java语言基础/0201-Java核心知识点/020102-IO模型.md&quot;,</span></span>
<span class="line"><span>// - &quot;docs/信长笔记2.0/02-Java语言基础/0201-Java核心知识点/020103-集合.md&quot;,</span></span>
<span class="line"><span>// - &quot;docs/信长笔记2.0/03-数据库与持久化/0301-关系型数据库/030101-PowerDesign简易教程.md&quot;,</span></span>
<span class="line"><span>// - &quot;docs/信长笔记2.0/03-数据库与持久化/0301-关系型数据库/030102-索引.md&quot;,</span></span>
<span class="line"><span>// - &quot;docs/信长笔记2.0/03-数据库与持久化/0301-关系型数据库/030103-MySQL基础.md&quot;,</span></span>
<span class="line"><span>// 请实现一个sidebar.mts脚本, 生成一个sidebar数组, 要求</span></span>
<span class="line"><span>// 1. 递归扫描&quot;/docs/信长笔记2.0&quot;文件夹, 直至找到所有的md文件, 跳过&quot;/image&quot;文件夹以及该文件夹下的所有内容</span></span>
<span class="line"><span>// 2. 允许文件夹为空</span></span>
<span class="line"><span>// 3. sidebar.mts应该export一个generateSidebar的方法, 并且把最终生成的数组打印到控制台</span></span>
<span class="line"><span>// sidebar示例如下:</span></span>
<span class="line"><span>//  [</span></span>
<span class="line"><span>//       {</span></span>
<span class="line"><span>//         text: &quot;Java语言基础&quot;,</span></span>
<span class="line"><span>//         items: [</span></span>
<span class="line"><span>//           {</span></span>
<span class="line"><span>//             text: &quot;Java核心知识点&quot;,</span></span>
<span class="line"><span>//             items: [</span></span>
<span class="line"><span>//               {</span></span>
<span class="line"><span>//                 text: &quot;Java语言基础&quot;,</span></span>
<span class="line"><span>//                 link: &quot;/02-Java语言基础/0201-Java核心知识点/020101-Java语言基础&quot;,</span></span>
<span class="line"><span>//               },</span></span>
<span class="line"><span>//               {</span></span>
<span class="line"><span>//                 text: &quot;IO模型&quot;,</span></span>
<span class="line"><span>//                 link: &quot;/02-Java语言基础/0201-Java核心知识点/020102-IO模型&quot;,</span></span>
<span class="line"><span>//               },</span></span>
<span class="line"><span>//               {</span></span>
<span class="line"><span>//                 text: &quot;集合&quot;,</span></span>
<span class="line"><span>//                 link: &quot;/02-Java语言基础/0201-Java核心知识点/020103-集合&quot;,</span></span>
<span class="line"><span>//               },</span></span>
<span class="line"><span>//             ],</span></span>
<span class="line"><span>//           },</span></span>
<span class="line"><span>//           {</span></span>
<span class="line"><span>//             text: &quot;并发与多线程&quot;,</span></span>
<span class="line"><span>//             items: [],</span></span>
<span class="line"><span>//           },</span></span>
<span class="line"><span>//           {</span></span>
<span class="line"><span>//             text: &quot;JVM&quot;,</span></span>
<span class="line"><span>//             items: [</span></span>
<span class="line"><span>//               {</span></span>
<span class="line"><span>//                 text: &quot;JVM基础&quot;,</span></span>
<span class="line"><span>//                 link: &quot;/02-Java语言基础/0203-JVM/020301-JVM基础&quot;,</span></span>
<span class="line"><span>//               },</span></span>
<span class="line"><span>//             ],</span></span>
<span class="line"><span>//           },</span></span>
<span class="line"><span>//         ],</span></span>
<span class="line"><span>//       },</span></span>
<span class="line"><span>//     ]</span></span></code></pre></div><ul><li>这个脚本是AI写的, 建议先手动配置导航栏, 然后再让AI参考生成, 准确率更高, prompt参考如下:<div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>我在使用vitePress搭建博客, 其config.mts如下, 请完善一个sidebar.mts, 实现自动递归扫描 /信长笔记2.0 下的所有的文件夹, 自动生成侧边导航栏的功能, 并告知使用方式</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import { defineConfig } from &quot;vitepress&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// https://vitepress.dev/reference/site-config</span></span>
<span class="line"><span>export default defineConfig({</span></span>
<span class="line"><span>  title: &quot;信长笔记2.0&quot;,</span></span>
<span class="line"><span>  description: &quot;信长笔记2.0&quot;,</span></span>
<span class="line"><span>  srcDir: &quot;./信长笔记2.0&quot;,</span></span>
<span class="line"><span>  themeConfig: {</span></span>
<span class="line"><span>    // https://vitepress.dev/reference/default-theme-config</span></span>
<span class="line"><span>    nav: [</span></span>
<span class="line"><span>      { text: &quot;首页&quot;, link: &quot;/&quot; },</span></span>
<span class="line"><span>      // { text: &#39;Examples&#39;, link: &#39;/markdown-examples&#39; }</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>    sidebar: [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        text: &quot;Java语言基础&quot;,</span></span>
<span class="line"><span>        items: [</span></span>
<span class="line"><span>          {</span></span>
<span class="line"><span>            text: &quot;Java核心知识点&quot;,</span></span>
<span class="line"><span>            items: [</span></span>
<span class="line"><span>              {</span></span>
<span class="line"><span>                text: &quot;Java语言基础&quot;,</span></span>
<span class="line"><span>                link: &quot;/02-Java语言基础/0201-Java核心知识点/020101-Java语言基础&quot;,</span></span>
<span class="line"><span>              },</span></span>
<span class="line"><span>              {</span></span>
<span class="line"><span>                text: &quot;IO模型&quot;,</span></span>
<span class="line"><span>                link: &quot;/02-Java语言基础/0201-Java核心知识点/020102-IO模型&quot;,</span></span>
<span class="line"><span>              },</span></span>
<span class="line"><span>              {</span></span>
<span class="line"><span>                text: &quot;集合&quot;,</span></span>
<span class="line"><span>                link: &quot;/02-Java语言基础/0201-Java核心知识点/020103-集合&quot;,</span></span>
<span class="line"><span>              },</span></span>
<span class="line"><span>            ],</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>          {</span></span>
<span class="line"><span>            text: &quot;并发与多线程&quot;,</span></span>
<span class="line"><span>            items: [],</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>          {</span></span>
<span class="line"><span>            text: &quot;JVM&quot;,</span></span>
<span class="line"><span>            items: [</span></span>
<span class="line"><span>              {</span></span>
<span class="line"><span>                text: &quot;JVM基础&quot;,</span></span>
<span class="line"><span>                link: &quot;/02-Java语言基础/0203-JVM/020301-JVM基础&quot;,</span></span>
<span class="line"><span>              },</span></span>
<span class="line"><span>            ],</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>        ],</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>    socialLinks: [</span></span>
<span class="line"><span>      { icon: &quot;github&quot;, link: &quot;https://github.com/vuejs/vitepress&quot; },</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span></code></pre></div></li></ul><h3 id="预览" tabindex="-1">预览 <a class="header-anchor" href="#预览" aria-label="Permalink to &quot;预览&quot;">​</a></h3><ul><li><p><code>yarn docs:dev</code></p><p><img src="`+i+'" alt="1743942181149"></p></li></ul><p><img src="'+t+'" alt="1743942191100"></p><h2 id="个性化配置" tabindex="-1">个性化配置 <a class="header-anchor" href="#个性化配置" aria-label="Permalink to &quot;个性化配置&quot;">​</a></h2><h3 id="变更主题颜色" tabindex="-1">变更主题颜色 <a class="header-anchor" href="#变更主题颜色" aria-label="Permalink to &quot;变更主题颜色&quot;">​</a></h3><p><img src="'+c+`" alt="1743942256421"></p><h4 id="index-js" tabindex="-1">index.js <a class="header-anchor" href="#index-js" aria-label="Permalink to &quot;index.js&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import DefaultTheme from &quot;vitepress/theme&quot;;</span></span>
<span class="line"><span>import &quot;./custom.css&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export default DefaultTheme;</span></span></code></pre></div><h4 id="custom-css" tabindex="-1">custom.css <a class="header-anchor" href="#custom-css" aria-label="Permalink to &quot;custom.css&quot;">​</a></h4><ul><li>注释的链接里有全部的css样式, 我这里将蓝色改成了绿色</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/* 全部css: https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>:root {</span></span>
<span class="line"><span> /* 微信风格浅绿色调色板 */</span></span>
<span class="line"><span>  --vp-c-indigo-1: #66bc8c;     /* 浅薄荷绿（导航栏/页脚主色） */</span></span>
<span class="line"><span>  --vp-c-indigo-2: #4d9568;     /* 活力浅绿（按钮/图标主色） */</span></span>
<span class="line"><span>  --vp-c-indigo-3: #69c08e;     /* 渐变过渡绿（边框/分割线） */</span></span>
<span class="line"><span>  --vp-c-indigo-soft: rgba(158, 207, 150, 0.12); /* 半透明遮罩层 */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="部署" tabindex="-1">部署 <a class="header-anchor" href="#部署" aria-label="Permalink to &quot;部署&quot;">​</a></h3><hr><h2 id="q-a" tabindex="-1">Q&amp;A <a class="header-anchor" href="#q-a" aria-label="Permalink to &quot;Q&amp;A&quot;">​</a></h2><h3 id="q-为什么不用vuepress" tabindex="-1">Q: 为什么不用VuePress? <a class="header-anchor" href="#q-为什么不用vuepress" aria-label="Permalink to &quot;Q: 为什么不用VuePress?&quot;">​</a></h3><p>A: vuePress有大量&quot;bug&quot;, 如:</p><ul><li>目录结构要求每个文件夹下有个readme.md, 非常反人类, 我的笔记有多层级的目录结构, 十分不友好</li><li>md引用的图片仅支持与md同级文件夹的相对路径, 而使用vscode+Md Editor编辑的md文档, 图片是在image/xxx/的目录下的, 如下图, 因此我的笔记图片在vuePress上展示不出来</li></ul><p><img src="`+o+`" alt="1743941368209"></p><ul><li>尝试了多种自动生成目录的方案, 均不可行, 而vitePress更简洁, 一下子就搞定了</li></ul><h3 id="q-不支持上下标" tabindex="-1">Q: 不支持上下标? <a class="header-anchor" href="#q-不支持上下标" aria-label="Permalink to &quot;Q: 不支持上下标?&quot;">​</a></h3><p>A: 原生md语法是通过html标签来支持上下标的, 在vitePress可安装插件增强来支持, 上标为 <code>&lt;sup&gt;xx&lt;sup&gt;</code>, 下标为 <code>&lt;sub&gt;xxx&lt;sub&gt;</code>, 但vscode的Md Editor插件在编辑的时候会自动给html标签加上反引号, 会被自动改掉, 因此直接不用这个了</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>npm install markdown-it-sub markdown-it-sup -D</span></span>
<span class="line"><span></span></span>
<span class="line"><span>然后在 .vitepress/config.js 中配置：</span></span>
<span class="line"><span>import { defineConfig } from &#39;vitepress&#39;</span></span>
<span class="line"><span>import sub from &#39;markdown-it-sub&#39;</span></span>
<span class="line"><span>import sup from &#39;markdown-it-sup&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export default defineConfig({</span></span>
<span class="line"><span>  markdown: {</span></span>
<span class="line"><span>    config: md =&gt; {</span></span>
<span class="line"><span>      md.use(sub)</span></span>
<span class="line"><span>      md.use(sup)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>})</span></span></code></pre></div>`,36)]))}const f=n(r,[["render",u]]);export{v as __pageData,f as default};
