import { $ } from "bun";

const repo = "git@github.com:tkancf/tkancf.git";
await $`git clone ${repo}`;
