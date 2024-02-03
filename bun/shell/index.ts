// 外部コマンド実行テスト (問題なく動く)
// import { $ } from "bun";
//
// const repo = "git@github.com:tkancf/tkancf.git";
// await $`git clone ${repo}`;

// incremental write file
// const file = Bun.file("output.txt");
// const writer = file.writer();
//
// writer.write("it was the best of times\n");
// writer.write("it was the worst of times\n");
// writer.flush();

// これだと上書きになる
const data = `It was the best of times, it was the worst of times.`;
await Bun.write("output.txt", data);
