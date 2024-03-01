import { FC } from "hono/jsx";
import { globalCSS } from "./style";
import { css } from "hono/css";
import { Head } from "./Head";

export const Layout: FC = (props) => {
  return (
    <html class={globalCSS}>
      <Head metadata={props.metadata} />
      <Header {...props} />
      <main>{props.children}</main>
      <Footer />
    </html>
  );
};

export const Header: FC = (props) => {
  const headerCSS = css`
    header {
      margin: 0em 0 2em;
    }
    nav a {
      margin-right: 1em;
    }
    nav a:last-child {
      margin-right: 0;
    }
    h2 {
      margin: 0.5em 0;
    }
    a {
      display: inline-block;
      text-decoration: none;
    }
    a.active {
      font-weight: bolder;
      text-decoration: underline;
    }
  `;
  const path = new URL(props.metadata.url).pathname;
  return (
    <header class={headerCSS}>
      <h2>tkancf.com</h2>
      <nav>
        <a className={path === "/" ? "active" : ""} href="/">
          Home
        </a>
        <a className={path === "/blog" ? "active" : ""} href="/blog">
          Blog
        </a>
        <a className={path === "/about" ? "active" : ""} href="/about">
          About
        </a>
        <a href="https://github.com/tkancf">GitHub</a>
      </nav>
    </header>
  );
};

const Footer: FC = () => {
  return (
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
  );
};
