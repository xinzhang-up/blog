import * as fs from "fs";
import * as path from "path";

const rootDir = path.join(__dirname, "../信长笔记2.0");

function getDirDisplayName(dirName: string): string {
  const parts = dirName.split("-");
  return parts.slice(1).join("-");
}

function buildSidebar(dirPath: string): any[] {
  const items: any[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "image"||entry.name === "public") continue;

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      const subdirItems = buildSidebar(fullPath);
      if (subdirItems.length > 0) {
        const dirName = path.basename(fullPath);
        items.push({
          text: getDirDisplayName(dirName),
          collapsed:true,
          items: subdirItems,
        });
      }
    } else if (entry.isFile() && path.extname(entry.name) === ".md") {
      const fileName = path.basename(entry.name, ".md");
      items.push({
        text: getDirDisplayName(fileName),
        link: `/${relativePath.replace(/\\/g, "/").replace(/\.md$/, "")}`,
      });
    }
  }

  return items;
}

export default function generateSidebar() {
  const dirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "image")
    .map((e) => e.name);

  const sidebar = dirs.map((dir) => ({
    text: getDirDisplayName(dir),
    items: buildSidebar(path.join(rootDir, dir)),
  }));

  // console.log(JSON.stringify(sidebar, null, 2));
  return sidebar
}

generateSidebar();

// [prmopt留存]
// 现有以下文件
// - "docs/信长笔记2.0/02-Java语言基础/0201-Java核心知识点/020101-Java语言基础.md",
// - "docs/信长笔记2.0/02-Java语言基础/0201-Java核心知识点/020102-IO模型.md",
// - "docs/信长笔记2.0/02-Java语言基础/0201-Java核心知识点/020103-集合.md",
// - "docs/信长笔记2.0/03-数据库与持久化/0301-关系型数据库/030101-PowerDesign简易教程.md",
// - "docs/信长笔记2.0/03-数据库与持久化/0301-关系型数据库/030102-索引.md",
// - "docs/信长笔记2.0/03-数据库与持久化/0301-关系型数据库/030103-MySQL基础.md",
// 请实现一个sidebar.mts脚本, 生成一个sidebar数组, 要求
// 1. 递归扫描"/docs/信长笔记2.0"文件夹, 直至找到所有的md文件, 跳过"/image"文件夹以及该文件夹下的所有内容
// 2. 允许文件夹为空
// 3. sidebar.mts应该export一个generateSidebar的方法, 并且把最终生成的数组打印到控制台
// sidebar示例如下:
//  [
//       {
//         text: "Java语言基础",
//         items: [
//           {
//             text: "Java核心知识点",
//             items: [
//               {
//                 text: "Java语言基础",
//                 link: "/02-Java语言基础/0201-Java核心知识点/020101-Java语言基础",
//               },
//               {
//                 text: "IO模型",
//                 link: "/02-Java语言基础/0201-Java核心知识点/020102-IO模型",
//               },
//               {
//                 text: "集合",
//                 link: "/02-Java语言基础/0201-Java核心知识点/020103-集合",
//               },
//             ],
//           },
//           {
//             text: "并发与多线程",
//             items: [],
//           },
//           {
//             text: "JVM",
//             items: [
//               {
//                 text: "JVM基础",
//                 link: "/02-Java语言基础/0203-JVM/020301-JVM基础",
//               },
//             ],
//           },
//         ],
//       },
//     ]