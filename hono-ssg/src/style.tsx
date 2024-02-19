import { css } from "hono/css";

export const globalStyle = css`
  /*
  The CSS in this style tag is based off of Bear Blog's default CSS.
  https://github.com/HermanMartinus/bearblog/blob/297026a877bc2ab2b3bdfbd6b9f7961c350917dd/templates/styles/blog/default.css
  License MIT: https://github.com/HermanMartinus/bearblog/blob/master/LICENSE.md
 */
  body {
    font-family: Verdana, sans-serif;
    margin: auto;
    padding: 20px;
    max-width: 65ch;
    text-align: left;
    background-color: #fff;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.5;
    color: #444;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  strong,
  b {
    color: #222;
  }
  a {
    color: #3273dc;
  }
  nav a {
    margin-right: 10px;
  }
  textarea {
    width: 100%;
    font-size: 16px;
  }
  input {
    font-size: 16px;
  }
  content {
    line-height: 1.6;
  }
  table {
    width: 100%;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  code {
    padding: 2px 5px;
    background-color: #f2f2f2;
  }
  pre {
    padding: 1rem;
  }
  pre > code {
    all: unset;
  }
  blockquote {
    border: 1px solid #999;
    color: #222;
    padding: 2px 0px 2px 20px;
    margin: 0px;
    font-style: italic;
  }
`;
