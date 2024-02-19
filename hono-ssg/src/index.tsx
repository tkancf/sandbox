import { Hono } from "hono";
import { onlySSG, ssgParams } from "hono/ssg";
import { jsxRenderer } from "hono/jsx-renderer";
import { FC } from "hono/jsx";

const app = new Hono();
const title = "tkancf.com";

const Layout: FC = (props) => {
  return (
    <html>
      <link href="/static/style.css" rel="stylesheet" />
      <body>
        <header>
          <h1>{title}</h1>
          <a href="/">Home</a>
          <a href="/blog">Blog</a>
          <a href="/about">About</a>
        </header>
        <main>{props.children}</main>
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
  return c.render(<h1>Home🔥</h1>);
});

app.get("/blog", (c) => {
  return c.render(<h1>Blog</h1>);
});

app.get("/about", (c) => {
  return c.render(<h1>About</h1>);
});

type Post = {
  id: string;
};

const posts: Post[] = [{ id: "hello" }, { id: "morning" }, { id: "night" }];

app.get("/posts", (c) => {
  return c.render(
    <ul>
      {posts.map((post) => {
        return (
          <li>
            <a href={`/posts/${post.id}`}>{post.id}</a>
          </li>
        );
      })}
    </ul>
  );
});

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
