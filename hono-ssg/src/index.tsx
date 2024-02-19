import { Hono } from "hono";
import { onlySSG, ssgParams } from "hono/ssg";
import { jsxRenderer } from "hono/jsx-renderer";
import { FC } from "hono/jsx";
import { globalClass } from "./style";
import { css, Style } from "hono/css";

const app = new Hono();
const title = "tkancf.com";

const linkClass = css`
  margin-right: 10px; /* Adjust the spacing as needed */
  text-decoration: none; /* Optional: removes underline from links */
  color: inherit; /* Optional: ensures link color matches your design */
  &:last-child {
    margin-right: 0;
  }
`;

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <Style>{globalClass}</Style>
      </head>
      <body>
        <header>
          <h1>{title}</h1>
          <nav>
            <a class={linkClass} href="/">
              Home
            </a>
            <a class={linkClass} href="/blog">
              Blog
            </a>
            <a class={linkClass} href="/about">
              About
            </a>
          </nav>
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
