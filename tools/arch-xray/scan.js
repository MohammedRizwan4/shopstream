// scan.js — builds the module dependency graph at a git ref (or the working tree).
// A "module" is a top-level directory under src/modules. An edge module A -> B
// exists when any file in A requires/imports a file inside B.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODULES_ROOT = 'src/modules';
const WORKTREE = 'WORKTREE';
const SOURCE_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']);

function git(args, repoDir) {
  return execFileSync('git', args, {
    cwd: repoDir,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function listFiles(ref, repoDir) {
  if (ref === WORKTREE) {
    const files = [];
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else files.push(path.relative(repoDir, full).split(path.sep).join('/'));
      }
    };
    walk(path.join(repoDir, MODULES_ROOT));
    return files;
  }
  const out = git(['ls-tree', '-r', '--name-only', ref, '--', MODULES_ROOT], repoDir);
  return out.split('\n').filter(Boolean);
}

function readFile(ref, file, repoDir) {
  if (ref === WORKTREE) return fs.readFileSync(path.join(repoDir, file), 'utf8');
  return git(['show', `${ref}:${file}`], repoDir);
}

function moduleOf(file) {
  const parts = file.split('/');
  if (parts.length < 3 || parts[0] !== 'src' || parts[1] !== 'modules') return null;
  return parts[2];
}

const IMPORT_RE = /require\(\s*['"]([^'"]+)['"]\s*\)|from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function importsOf(source) {
  const specs = [];
  for (const match of source.matchAll(IMPORT_RE)) {
    specs.push(match[1] || match[2] || match[3]);
  }
  return specs;
}

function scanGraph(ref, repoDir) {
  const nodes = new Set();
  const edges = new Set();

  for (const file of listFiles(ref, repoDir)) {
    const fromModule = moduleOf(file);
    if (!fromModule) continue;
    nodes.add(fromModule);
    if (!SOURCE_EXT.has(path.posix.extname(file))) continue;

    const source = readFile(ref, file, repoDir);
    for (const spec of importsOf(source)) {
      if (!spec.startsWith('.')) continue; // only relative imports cross modules here
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
      const toModule = moduleOf(resolved);
      if (toModule && toModule !== fromModule) edges.add(`${fromModule}->${toModule}`);
    }
  }

  return {
    nodes: [...nodes].sort(),
    edges: [...edges].sort().map((key) => {
      const [from, to] = key.split('->');
      return { from, to };
    }),
  };
}

// Lines touched per module between two refs — drives the heat coloring.
function churnByModule(baseRef, headRef, repoDir) {
  const args = ['diff', '--numstat', baseRef];
  if (headRef !== WORKTREE) args.push(headRef);
  args.push('--', MODULES_ROOT);

  const churn = {};
  for (const line of git(args, repoDir).split('\n')) {
    const [added, removed, rawPath] = line.split('\t');
    if (!rawPath) continue;
    const file = rawPath.replace(/\{[^}]*=> ([^}]*)\}/g, '$1'); // rename syntax
    const mod = moduleOf(file);
    if (!mod) continue;
    const lines = (parseInt(added, 10) || 0) + (parseInt(removed, 10) || 0);
    churn[mod] = (churn[mod] || 0) + lines;
  }
  return churn;
}

module.exports = { scanGraph, churnByModule, WORKTREE };
