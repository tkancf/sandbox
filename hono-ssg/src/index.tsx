import { Hono } from "hono";
import { onlySSG, ssgParams } from "hono/ssg";
import { jsxRenderer } from "hono/jsx-renderer";
import { FC } from "hono/jsx";
import { globalClass } from "./style";
import { css, Style } from "hono/css";
import { getPosts } from "./post";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();
const title = "tkancf.com";
const posts = await getPosts();

const Layout: FC = (props) => {
  return (
    <html class={globalClass}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Style />
      </head>
      <body>
        <header>
          <h1>{title}</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="https://github.com/tkancf">GitHub</a>
            <a href="/about">About me</a>
          </nav>
        </header>
        <main>{props.children}</main>
        <footer>
          <p>© 2024 tkancf.com</p>
        </footer>
      </body>
    </html>
  );
};

app.use("*", serveStatic({ root: "public" }));

app.all(
  "*",
  jsxRenderer(({ children }) => {
    return <Layout>{children}</Layout>;
  })
);

const postListClass = css`
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
  return c.render(
    <div class={postListClass}>
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
  );
});

app.get("/blog", async (c) => {
  // return all posts
  return c.render(
    <div class={postListClass}>
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
    return c.render(
      <>
        <h1>{post.title}</h1>
        <div>slug: {slug}</div>
        <div>投稿日: {post.pubDate}</div>
        <div>{post.description}</div>
        <hr></hr>
        <div dangerouslySetInnerHTML={{ __html: post.body }}></div>
      </>
    );
  }
);

app.get("/about", (c) => {
  return c.render(<h1>About</h1>);
});

// SSGでビルドしたときだけアクセスできるエンドポイント
app.get("/status", onlySSG(), (c) => c.json({ ok: true }));

app.get("/404", (c) => c.notFound());

export default app;
