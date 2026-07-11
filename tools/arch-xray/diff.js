// diff.js — compares two module graphs and checks architecture rules.

const edgeKey = (e) => `${e.from}->${e.to}`;

// Tarjan strongly connected components; edges inside an SCC of size > 1 are cycle edges.
function cycleEdges(nodes, edges) {
  const adj = new Map(nodes.map((n) => [n, []]));
  for (const e of edges) if (adj.has(e.from)) adj.get(e.from).push(e.to);

  let index = 0;
  const meta = new Map();
  const stack = [];
  const sccOf = new Map();
  let sccCount = 0;
  const sccSizes = [];

  const strongConnect = (v) => {
    meta.set(v, { index, lowlink: index, onStack: true });
    index++;
    stack.push(v);
    for (const w of adj.get(v) || []) {
      if (!meta.has(w)) {
        strongConnect(w);
        meta.get(v).lowlink = Math.min(meta.get(v).lowlink, meta.get(w).lowlink);
      } else if (meta.get(w).onStack) {
        meta.get(v).lowlink = Math.min(meta.get(v).lowlink, meta.get(w).index);
      }
    }
    if (meta.get(v).lowlink === meta.get(v).index) {
      let size = 0;
      let w;
      do {
        w = stack.pop();
        meta.get(w).onStack = false;
        sccOf.set(w, sccCount);
        size++;
      } while (w !== v);
      sccSizes[sccCount] = size;
      sccCount++;
    }
  };

  for (const n of nodes) if (!meta.has(n)) strongConnect(n);

  const inCycle = new Set();
  for (const e of edges) {
    if (sccOf.get(e.from) === sccOf.get(e.to) && sccSizes[sccOf.get(e.from)] > 1) {
      inCycle.add(edgeKey(e));
    }
  }
  return inCycle;
}

function diffGraphs(baseGraph, headGraph, rules = {}) {
  const baseNodes = new Set(baseGraph.nodes);
  const headNodes = new Set(headGraph.nodes);
  const baseEdges = new Set(baseGraph.edges.map(edgeKey));
  const headEdges = new Set(headGraph.edges.map(edgeKey));

  const nodes = [...new Set([...baseGraph.nodes, ...headGraph.nodes])].sort().map((name) => ({
    name,
    status: !baseNodes.has(name) ? 'added' : !headNodes.has(name) ? 'removed' : 'kept',
  }));

  const forbiddenRules = new Set(rules.forbidden || []);
  const inCycle = rules.noCycles === false
    ? new Set()
    : cycleEdges(headGraph.nodes, headGraph.edges);

  const allEdgeKeys = [...new Set([...baseEdges, ...headEdges])].sort();
  const edges = allEdgeKeys.map((key) => {
    const [from, to] = key.split('->');
    return {
      from,
      to,
      status: !baseEdges.has(key) ? 'added' : !headEdges.has(key) ? 'removed' : 'kept',
      forbidden: headEdges.has(key) && forbiddenRules.has(key),
      inCycle: headEdges.has(key) && inCycle.has(key),
    };
  });

  const addedNodes = nodes.filter((n) => n.status === 'added').map((n) => n.name);
  const removedNodes = nodes.filter((n) => n.status === 'removed').map((n) => n.name);
  const addedEdges = edges.filter((e) => e.status === 'added').map(edgeKey);
  const removedEdges = edges.filter((e) => e.status === 'removed').map(edgeKey);
  const forbiddenEdges = edges.filter((e) => e.forbidden).map(edgeKey);
  const cycleEdgeList = edges.filter((e) => e.inCycle).map(edgeKey);

  return {
    changed:
      addedNodes.length + removedNodes.length + addedEdges.length + removedEdges.length > 0,
    nodes,
    edges,
    summary: { addedNodes, removedNodes, addedEdges, removedEdges, forbiddenEdges, cycleEdges: cycleEdgeList },
  };
}

module.exports = { diffGraphs };
