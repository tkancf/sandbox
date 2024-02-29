import { Hono } from "hono";
import { onlySSG, ssgParams } from "hono/ssg";
import { FC } from "hono/jsx";
import { globalCSS } from "./style";
import { css, Style } from "hono/css";
import { getPosts } from "./post";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();
const siteTitle = "tkancf.com";
const posts = await getPosts();
type Metadata = {
  title: string;
  pubDate: string;
  description: string;
  ogImage: string;
};
const metadata: Metadata = {
  title: "tkancf.com",
  pubDate: "2024-01-01",
  description: "tkancf.com",
  ogImage: "/icon.jpg",
};

const Layout: FC = (props) => {
  return (
    <html class={globalCSS}>
      <head>
        <title>{props.metadata.title}</title>
        <Style />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <link rel="sitemap" href="/sitemap.xml" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="title" content={props.metadata.title} />
        <meta name="description" content={props.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={props.metadata.url} />
        <meta property="og:title" content={props.metadata.title} />
        <meta property="og:description" content={props.metadata.description} />
        <meta property="og:image" content={props.metadata.ogImage} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={props.metadata.url} />
        <meta property="twitter:title" content={props.metadata.title} />
        <meta
          property="twitter:description"
          content={props.metadata.description}
        />
        <meta property="twitter:image" content={props.metadata.ogImage} />
      </head>
      <body>
        <header>
          <h1>{siteTitle}</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="https://github.com/tkancf">GitHub</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <main>{props.children}</main>
        <footer
          class={css`
            div {
              display: flex;
              justify-content: center;
            }
          `}
        >
          <div>© 2024 tkancf.com</div>
        </footer>
      </body>
    </html>
  );
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
    return c.render(
      <Layout metadata={metadata}>
        <h1>{post.title}</h1>
        <div>slug: {slug}</div>
        <div>投稿日: {post.pubDate}</div>
        <div>{post.description}</div>
        <hr></hr>
        <div dangerouslySetInnerHTML={{ __html: post.body }}></div>
      </Layout>
    );
  }
);

app.get("/about", (c) => {
  return c.render(
    <Layout metadata={metadata}>
      <p>
        tkancfというユーザ名で登録していることが多いです。
        <br />
        よく使ってるアイコン↓
      </p>
      <img
        src="/icon.jpg"
        alt="tkancf"
        width="150"
        height="150"
        loading="lazy"
      />
      <h2>アカウント・リンク集</h2>
      ブログ等の記事は外部サイト含めて、記事一覧ページ(
      <a href="https://tkancf.com/blog">tkancf.com/blog</a>)
      にあるので、まとめて見たい場合はそちらを参照してください。
      <ul>
        <li>
          GitHub: <a href="https://github.com/tkancf">@tkancf</a>
        </li>
        <li>
          Twitter: <a href="https://twitter.com/tkancf">@tkancf</a>
        </li>
        <li>
          Bluesky:{" "}
          <a href="https://bsky.app/profile/tkancf.bsky.social">
            @tkancf.bsky.social
          </a>
        </li>
        <li>
          Zenn: <a href="https://zenn.dev/tkancf">@tkancf</a>
        </li>
        <li>
          はてなブログ: <a href="https://tkancf.hateblo.jp/">@tkancf</a>
        </li>
        <li>
          Qiita: <a href="https://qiita.com/tkancf">@tkancf</a>
        </li>
      </ul>
      <h2>趣味</h2>
      <ul>
        <li>プログラミング</li>
        <li>コーヒー</li>
        <li>美味しいものを食べに行く</li>
        <li>漫画</li>
      </ul>
      <h2>仕事</h2>
      <ul>
        <li>2018/07 - 2022/07</li>
        <ul>
          <li>MSPの会社でクラウドインフラのエンジニア(運用・保守)</li>
        </ul>
        <li>2022/08 - 現在</li>
        <ul>
          <li>上記エンジニアチームのプレイングマネージャー</li>
        </ul>
      </ul>
    </Layout>
  );
});

// SSGでビルドしたときだけアクセスできるエンドポイント
app.get("/status", onlySSG(), (c) => c.json({ ok: true }));

app.get("/404", (c) => c.notFound());

export default app;
