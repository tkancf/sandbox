import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import fs from "fs";
import path from "path";
import remarkFrontmatter from "remark-frontmatter";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import remarkExpressiveCode from "remark-expressive-code";
import yaml from "yaml";

type Post = {
  slug: string;
  title: string;
  pubDate: string;
  description: string;
  body: string;
};

const filePath = "./src/example.md";
const content = fs.readFileSync(filePath, { encoding: "utf-8" });
const result = await remark()
  .use(remarkParse)
  .use(remarkFrontmatter, [{ type: "yaml", marker: "-", anywhere: false }])
  .use(remarkExtractFrontmatter, {
    yaml: yaml.parse,
    name: "frontMatter", // result.data 配下のキー名を決める
  })
  .use(remarkExpressiveCode, {
    theme: "github-light",
  })
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .use(remarkGfm)
  .process(content);

export const post: Post = {
  slug: path.parse(path.basename(filePath)).name,
  title: (result.data.frontMatter as any).title,
  pubDate: (result.data.frontMatter as any).pubDate,
  description: (result.data.frontMatter as any).description,
  body: result.toString(),
};

export const posts: Post[] = [post];
