import { FC } from "hono/jsx";
import { css } from "hono/css";

export const Footer: FC = () => {
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
