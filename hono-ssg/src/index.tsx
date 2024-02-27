import { Hono } from "hono";
import { onlySSG, ssgParams } from "hono/ssg";
import { jsxRenderer } from "hono/jsx-renderer";
import { FC } from "hono/jsx";
import { globalClass } from "./style";
import { Style } from "hono/css";
import { posts } from "./post";

const app = new Hono();
const title = "tkancf.com";

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Style>{globalClass}</Style>
      </head>
      <body>
        <header>
          <h1>{title}</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="/about">About</a>
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

app.all(
  "*",
  jsxRenderer(({ children }) => {
    return <Layout>{children}</Layout>;
  })
);

app.get("/", (c) => {
  return c.render(
    <>
      <h1>Home🔥</h1>
      <p>
        Welcome to my blog! This is a sample blog built with Hono. You can find
        the source code for this blog{" "}
      </p>
    </>
  );
});

app.get("/blog", async (c) => {
  // return all posts
  return c.render(
    <>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li>
            <time>{post.pubDate}</time>
            <a href={`/blog/${post.slug}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </>
  );
});

app.get("/blog/:slug", (c) => {
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
});

app.get("/about", (c) => {
  return c.render(<h1>About</h1>);
});

type Post = {
  id: string;
};

app.get(
  "/posts/:id",
  ssgParams(() => posts),
  (c) => {
    return c.render(<h1>{c.req.param("id")}</h1>);
  }
);

// SSGでビルドしたときだけアクセスできるエンドポイント
app.get("/status", onlySSG(), (c) => c.json({ ok: true }));

app.get("/404", (c) => c.notFound());

export default app;
