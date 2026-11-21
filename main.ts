// main.ts — the program the harness runs: node /bot/main.ts.
// Read every case from /input/cases.json ({id, input}), answer each one alone with run() from
// solve.js, write /output/answers.json: one answer per case, in the cases' order.
// Outside the sandbox, MAKEFUN_INPUT_DIR and MAKEFUN_OUTPUT_DIR stand in for /input and /output.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';

// V8's incremental marking off before solve.js is imported, so all of its work runs without it.
setFlagsFromString('--no-incremental-marking');

/** solve.js by URL (a .js module carries no types). */
const { run } = (await import(new URL('./solve.js', import.meta.url).href)) as {
  run: (input: { text: string; header: boolean }) => unknown;
};

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

type Case = { id: string; input: { text: string; header: boolean } };

const cases = JSON.parse(readFileSync(join(INPUT_DIR, 'cases.json'), 'utf8')) as Case[];
const answers: unknown[] = new Array(cases.length);
for (let k = 0; k < cases.length; k++) answers[k] = run(cases[k].input);
writeFileSync(join(OUTPUT_DIR, 'answers.json'), JSON.stringify(answers));
