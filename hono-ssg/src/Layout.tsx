import { FC } from "hono/jsx";
import { globalCSS } from "./style";
import { css } from "hono/css";
import { Head } from "./Head";

export const Layout: FC = (props) => {
  return (
    <html class={globalCSS}>
      <Head metadata={props.metadata} />
      <Header />
      <main>{props.children}</main>
      <Footer />
    </html>
  );
};

export const Header: FC = () => {
  return (
    <header>
      <h1>tkancf.com</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="https://github.com/tkancf">GitHub</a>
        <a href="/about">About</a>
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
