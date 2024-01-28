import { $ } from 'bun';

// Run a cross-platform shell command
await $`echo "Hello, world!"`;

const response = await fetch("https://example.com");

// Pipe the response body to gzip
const data = await $`gzip < ${response}`.arrayBuffer();
