// render.js — turns a graph diff into Graphviz dot, plus markdown/json summaries.

function heatFill(lines = 0) {
  if (lines === 0) return { fill: '#f8fafc', font: '#1e293b' };
  if (lines < 15) return { fill: '#fef9c3', font: '#1e293b' };
  if (lines < 40) return { fill: '#fde68a', font: '#1e293b' };
  if (lines < 80) return { fill: '#fca5a5', font: '#7f1d1d' };
  return { fill: '#dc2626', font: '#ffffff' };
}

function nodeLine(node, churn) {
  const attrs = [];
  if (node.status === 'removed') {
    attrs.push(
      'label=<<s>' + node.name + '</s>>',
      'style="rounded,filled,dashed"',
      'color="#9ca3af"',
      'fillcolor="#f9fafb"',
      'fontcolor="#9ca3af"'
    );
  } else {
    const heat = heatFill(churn[node.name]);
    attrs.push(`style="rounded,filled"`, `fillcolor="${heat.fill}"`, `fontcolor="${heat.font}"`);
    if (node.status === 'added') {
      attrs.push('color="#16a34a"', 'penwidth=2.5', `label=<${node.name} <font color="#16a34a"><b>+</b></font>>`);
    } else {
      attrs.push('color="#94a3b8"', 'penwidth=1.2');
    }
  }
  return `  "${node.name}" [${attrs.join(', ')}];`;
}

function edgeLine(edge) {
  const attrs = [];
  if (edge.forbidden) {
    attrs.push('color="#dc2626"', 'style=dotted', 'penwidth=2.2', 'label="forbidden"', 'fontcolor="#dc2626"', 'fontsize=10');
  } else if (edge.status === 'removed') {
    attrs.push('color="#9ca3af"', 'style=dashed');
  } else if (edge.status === 'added') {
    attrs.push('color="#16a34a"', 'penwidth=2');
  } else if (edge.inCycle) {
    attrs.push('color="#f59e0b"', 'penwidth=2', 'label="cycle"', 'fontcolor="#b45309"', 'fontsize=10');
  } else {
    attrs.push('color="#64748b"', 'arrowsize=0.8');
  }
  return `  "${edge.from}" -> "${edge.to}" [${attrs.join(', ')}];`;
}

function toDot(diff, churn, title) {
  return [
    'digraph arch {',
    `  label="${title.replace(/"/g, "'")}";`,
    '  labelloc=t;',
    '  fontname="Helvetica,Arial,sans-serif";',
    '  fontsize=16;',
    '  rankdir=TB;',
    '  nodesep=0.55;',
    '  ranksep=0.8;',
    '  bgcolor="white";',
    '  node [shape=box, fontname="Helvetica,Arial,sans-serif", fontsize=13, margin="0.22,0.12"];',
    '  edge [fontname="Helvetica,Arial,sans-serif"];',
    ...diff.nodes.map((n) => nodeLine(n, churn)),
    ...diff.edges.map(edgeLine),
    '}',
  ].join('\n');
}

function toMarkdown(diff, churn) {
  const s = diff.summary;
  const list = (items, format = (x) => `\`${x}\``) =>
    items.length ? items.map(format).join(', ') : '—';
  const edgeFmt = (key) => '`' + key.replace('->', ' → ') + '`';

  const lines = [
    '| | |',
    '|---|---|',
    `| 🟢 Added modules | ${list(s.addedNodes)} |`,
    `| ⚪ Removed modules | ${list(s.removedNodes)} |`,
    `| ➕ New dependencies | ${list(s.addedEdges, edgeFmt)} |`,
    `| ➖ Removed dependencies | ${list(s.removedEdges, edgeFmt)} |`,
  ];
  if (s.forbiddenEdges.length) {
    lines.push(`| ⛔ **Forbidden dependencies** | ${list(s.forbiddenEdges, edgeFmt)} |`);
  }
  if (s.cycleEdges.length) {
    lines.push(`| 🔄 **Dependency cycle** | ${list(s.cycleEdges, edgeFmt)} |`);
  }
  const hot = Object.entries(churn)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mod, n]) => `\`${mod}\` (${n})`);
  if (hot.length) lines.push(`| 🔥 Churn (lines) | ${hot.join(', ')} |`);

  lines.push(
    '',
    '<sub>Legend: 🟢 green border = added · dashed/struck = removed · red dotted = forbidden by ' +
      '<code>arch-rules.json</code> · orange = cycle · node fill = churn heat</sub>'
  );
  return lines.join('\n');
}

module.exports = { toDot, toMarkdown };
