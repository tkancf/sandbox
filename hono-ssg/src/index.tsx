import { Hono } from "hono";
import { ssgParams } from "hono/ssg";
import { css } from "hono/css";
import { getPosts } from "./lib/post";
import { serveStatic } from "@hono/node-server/serve-static";
import { Layout } from "./components/Layout";
import { About } from "./components/About";

const app = new Hono();

const posts = await getPosts();

type Metadata = {
  title: string;
  url: string;
  description: string;
  ogImage?: string;
};

let metadata: Metadata = {
  title: "tkancf.com",
  url: "https://tkancf.com",
  description: "",
  ogImage: "/icon.jpg",
};

app.use("*", serveStatic({ root: "public" }));

const postListCSS = css`
  ul {
    list-style-type: none;
    padding: unset;
  }
  ul li {
    display: flex;
    margin-bottom: 8px;
  }
  time {
    flex: 0 0 130px;
    font-style: italic;
    color: #595959;
  }
  ul li a:visited {
    color: #8e32dc;
  }
`;

app.get("/", (c) => {
  metadata = {
    description: "tkancfのブログです。主にIT技術関連のメモなどを書いています。",
    ogImage: "/icon.jpg",
    title: "tkancf.com",
    url: "https://tkancf.com",
  };
  return c.render(
    <Layout metadata={metadata}>
      <div class={postListCSS}>
        <h2>最新の記事</h2>
        <ul>
          {posts
            .map((post) => (
              <li>
                <time>{post.pubDate}</time>
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </li>
            ))
            .slice(0, 5)}
        </ul>
      </div>
    </Layout>
  );
});

app.get("/blog", async (c) => {
  metadata = {
    description: "tkancfのブログの記事一覧ページです。",
    ogImage: "/icon.jpg",
    title: "tkancf.com - ブログ記事一覧",
    url: "https://tkancf.com/blog",
  };
  return c.render(
    <Layout metadata={metadata}>
      <div class={postListCSS}>
        <h2>記事一覧</h2>
        <ul>
          {posts.map((post) => (
            <li>
              <time>{post.pubDate}</time>
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
});

app.get(
  "/blog/:slug",
  ssgParams(async () => {
    return posts.map((post) => {
      return {
        slug: post.slug,
      };
    });
  }),
  async (c) => {
    const slug = c.req.param("slug");
    const post = posts.find((p) => p.slug === slug);
    if (!post) {
      return c.redirect("/404");
    }
    metadata = {
      description: post.description,
      ogImage: post.heroImage,
      title: "tkancf.com - ブログ記事一覧",
      url: "https://tkancf.com/blog/" + post.slug,
    };
    return c.render(
      <Layout metadata={metadata}>
        <h1>{post.title}</h1>
        <div>投稿日: {post.pubDate}</div>
        <hr />
        <div dangerouslySetInnerHTML={{ __html: post.body }}></div>
      </Layout>
    );
  }
);

app.get("/about", (c) => {
  metadata = {
    description: "tkancfのブログのAboutページです。About meを含みます。",
    ogImage: "/icon.jpg",
    title: "tkancf.com - About",
    url: "https://tkancf.com/about",
  };
  return c.render(
    <Layout metadata={metadata}>
      <About />
    </Layout>
  );
});

app.get("/404", (c) => c.notFound());

export default app;
