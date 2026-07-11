#!/usr/bin/env node
// ArchXray CLI — compare the module graph between two git refs and render the diff.
//
//   node tools/arch-xray/index.js --base main --head HEAD --out out
//   node tools/arch-xray/index.js --base main --head WORKTREE   (uncommitted state)
//
// Writes to <out>/: arch-diff.svg, arch-diff.dot, summary.md, summary.json.
// summary.json.changed tells CI whether to post a comment.
const fs = require('fs');
const path = require('path');
const { scanGraph, churnByModule, WORKTREE } = require('./scan');
const { diffGraphs } = require('./diff');
const { toDot, toMarkdown } = require('./render');

function parseArgs(argv) {
  const args = { base: 'main', head: 'HEAD', out: 'out', repo: process.cwd(), title: '' };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    if (!(key in args)) throw new Error(`Unknown option: ${argv[i]}`);
    args[key] = argv[i + 1];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoName = path.basename(args.repo);
  const title =
    args.title || `Architecture impact — ${repoName} (${args.base.slice(0, 12)} → ${args.head === WORKTREE ? 'working tree' : args.head.slice(0, 12)})`;

  const baseGraph = scanGraph(args.base, args.repo);
  const headGraph = scanGraph(args.head, args.repo);

  let rules = {};
  const rulesPath = path.join(args.repo, 'arch-rules.json');
  if (fs.existsSync(rulesPath)) rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

  const diff = diffGraphs(baseGraph, headGraph, rules);
  const churn = churnByModule(args.base, args.head, args.repo);

  fs.mkdirSync(args.out, { recursive: true });
  fs.writeFileSync(
    path.join(args.out, 'summary.json'),
    JSON.stringify({ title, ...diff.summary, changed: diff.changed }, null, 2)
  );

  if (!diff.changed) {
    console.log('No architecture changes — staying quiet.');
    return;
  }

  const dot = toDot(diff, churn, title);
  fs.writeFileSync(path.join(args.out, 'arch-diff.dot'), dot);
  fs.writeFileSync(path.join(args.out, 'summary.md'), toMarkdown(diff, churn));

  const { instance } = require('@viz-js/viz');
  const viz = await instance();
  const svg = viz.renderString(dot, { format: 'svg' });
  fs.writeFileSync(path.join(args.out, 'arch-diff.svg'), svg);

  const s = diff.summary;
  console.log(
    `Architecture changed: +${s.addedNodes.length} modules, -${s.removedNodes.length} modules, ` +
      `+${s.addedEdges.length} deps, -${s.removedEdges.length} deps` +
      (s.forbiddenEdges.length ? `, ${s.forbiddenEdges.length} FORBIDDEN` : '') +
      (s.cycleEdges.length ? `, cycle detected` : '')
  );
  console.log(`Wrote ${path.join(args.out, 'arch-diff.svg')}`);
}

main().catch((err) => {
  console.error(`arch-xray failed: ${err.message}`);
  process.exit(1);
});
