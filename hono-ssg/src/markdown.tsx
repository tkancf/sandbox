import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import fs from "fs";
import remarkFrontmatter from "remark-frontmatter";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import yaml from "yaml";

const filePath = "./src/example.md";
const content = fs.readFileSync(filePath, { encoding: "utf-8" });
const result = await remark()
  .use(remarkParse)
  .use(remarkFrontmatter, [{ type: "yaml", marker: "-", anywhere: false }])
  .use(remarkExtractFrontmatter, {
    yaml: yaml.parse,
    name: "frontMatter", // result.data 配下のキー名を決める
  })
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .use(remarkGfm)
  .process(content);

const frontmatter = result;
console.log(frontmatter);
export const body = result.toString();
