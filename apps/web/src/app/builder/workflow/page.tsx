'use client';

import { useState } from 'react';
import Link from 'next/link';

interface WFNode {
  id: string;
  type: 'input' | 'ai' | 'output';
  position: { x: number; y: number };
  data: { label: string; config: { prompt: string; model?: string } };
}
interface WFEdge { id: string; source: string; target: string; }

const NODE_LABELS: Record<string, string> = { input: 'Input', ai: 'AI Process', output: 'Output' };
const AI_MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)', provider: 'groq' },
  { id: 'mistral-large-latest', label: 'Mistral Large', provider: 'mistral' },
  { id: 'gpt-4o', label: 'GPT-4o (GitHub)', provider: 'github' },
];

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<WFNode[]>([]);
  const [edges, setEdges] = useState<WFEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [automated, setAutomated] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  const addNode = (type: 'input' | 'ai' | 'output') => {
    const id = `${type}-${Date.now()}`;
    setNodes([...nodes, {
      id, type,
      position: { x: 80 + Math.random() * 300, y: 80 + Math.random() * 250 },
      data: { label: NODE_LABELS[type] || type, config: { prompt: '', model: type === 'ai' ? AI_MODELS[0]!.id : '' } },
    }]);
  };

  const updateNode = (id: string, updates: Partial<WFNode['data']>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    if (edges.some(e => e.source === sourceId && e.target === targetId)) return;
    setEdges([...edges, { id: `e-${Date.now()}`, source: sourceId, target: targetId }]);
  };

  const handleRun = async () => {
    if (nodes.length === 0) { setError('Add at least one node'); return; }
    const aiNodes = nodes.filter(n => n.type === 'ai');
    if (automated && aiNodes.some(n => !n.data.config.prompt.trim())) {
      setError('All AI nodes need a prompt. Click a node to add one.'); return;
    }
    setRunning(true); setError(null); setResult(null);
    try {
      const response = await fetch('/api/workflow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Execution failed');
      setResult(data);
      const history = JSON.parse(localStorage.getItem('triforce-history') || '[]');
      history.unshift({ id: data.workflowId, type: 'workflow', nodes: nodes.length, timestamp: new Date().toISOString(), status: 'completed' });
      localStorage.setItem('triforce-history', JSON.stringify(history.slice(0, 50)));
    } catch (err: any) { setError(err.message); } finally { setRunning(false); }
  };

  const handleExport = async (format: 'typescript' | 'python' | 'json' | 'yaml') => {
    setExporting(format);
    try {
      const response = await fetch('/api/export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, format, name: 'my-workflow' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Export failed');
      const content = data.output || data.code || '';
      const ext = format === 'typescript' ? 'ts' : format === 'python' ? 'py' : format;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `workflow.${ext}`; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) { setError(err.message); } finally { setExporting(null); }
  };

  const nodeColor = (type: string) => type === 'input' ? 'bg-blue-600' : type === 'ai' ? 'bg-purple-600' : 'bg-green-600';

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">← Back to Builders</Link>

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-5xl font-bold mb-2">⚡ Workflow Builder</h1>
            <p className="text-xl text-slate-400">Design AI pipelines with real execution</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={automated} onChange={(e) => setAutomated(e.target.checked)} className="w-4 h-4 accent-purple-500" />
              <span>Automated</span>
            </label>
            <button onClick={handleRun} disabled={running || nodes.length === 0}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold disabled:opacity-50">
              {running ? '⏳ Running...' : '▶ Run Workflow'}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-sm">{error}</div>}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Add Nodes</h3>
              <div className="space-y-2">
                <button onClick={() => addNode('input')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg">📥 Input</button>
                <button onClick={() => addNode('ai')} className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg">🤖 AI Process</button>
                <button onClick={() => addNode('output')} className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg">📤 Output</button>
              </div>
            </div>

            {/* Node config panel — the input field */}
            {selectedNode && (
              <div className="bg-slate-800 border border-purple-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">⚙️ {selectedNode.data.label}</h3>
                  <button onClick={() => deleteNode(selectedNode.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>

                <label className="block text-xs text-slate-400 mb-1">
                  {selectedNode.type === 'input' ? 'Input Data' : selectedNode.type === 'ai' ? 'AI Prompt' : 'Output Label'}
                </label>
                <textarea
                  value={selectedNode.data.config.prompt}
                  onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.data.config, prompt: e.target.value } })}
                  className="w-full h-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white resize-none"
                  placeholder={selectedNode.type === 'input' ? 'Enter input data to process...' : selectedNode.type === 'ai' ? 'Enter the AI prompt for this node...' : 'Label for output...'}
                />

                {selectedNode.type === 'ai' && (
                  <>
                    <label className="block text-xs text-slate-400 mb-1 mt-3">Model</label>
                    <select
                      value={selectedNode.data.config.model}
                      onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.data.config, model: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white"
                    >
                      {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </>
                )}

                <label className="block text-xs text-slate-400 mb-1 mt-3">Label</label>
                <input
                  type="text" value={selectedNode.data.label}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white"
                />
              </div>
            )}

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">📤 Export</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['typescript', 'python', 'json', 'yaml'] as const).map(fmt => (
                  <button key={fmt} onClick={() => handleExport(fmt)} disabled={!!exporting || nodes.length === 0}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm disabled:opacity-50">
                    {exporting === fmt ? '...' : fmt === 'typescript' ? 'TypeScript' : fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Stats</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Nodes:</span><span className="font-mono">{nodes.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Connections:</span><span className="font-mono">{edges.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">AI nodes:</span><span className="font-mono">{nodes.filter(n => n.type === 'ai').length}</span></div>
              </div>
            </div>
          </div>

          {/* Canvas + Results */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-700 rounded-lg h-[400px] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">Add nodes from the left panel to start building</div>
              )}
              <div className="absolute inset-0">
                {nodes.map((node) => (
                  <div key={node.id} onClick={() => setSelectedNodeId(node.id)}
                    className={`absolute cursor-pointer select-none ${nodeColor(node.type)} rounded-lg shadow-lg border-2 ${selectedNodeId === node.id ? 'border-white' : 'border-transparent'}`}
                    style={{ left: node.position.x, top: node.position.y, minWidth: '140px', padding: '12px 16px' }}>
                    <div className="font-medium text-sm">{node.data.label}</div>
                    {node.data.config.prompt && <div className="text-xs opacity-70 truncate mt-1 max-w-[120px]">{node.data.config.prompt.slice(0, 30)}...</div>}
                    {node.type !== 'input' && <div className="absolute -top-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-110"
                      onClick={(e) => { e.stopPropagation(); const t = prompt('Connect FROM which node ID?'); if (t) connectNodes(t, node.id); }} />}
                    {node.type !== 'output' && <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-110"
                      onClick={(e) => { e.stopPropagation(); const t = prompt('Connect TO which node ID?'); if (t) connectNodes(node.id, t); }} />}
                  </div>
                ))}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                  {edges.map((edge) => {
                    const s = nodes.find(n => n.id === edge.source); const t = nodes.find(n => n.id === edge.target);
                    if (!s || !t) return null;
                    return <line key={edge.id} x1={s.position.x + 70} y1={s.position.y + 60} x2={t.position.x + 70} y2={t.position.y} stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow)" />;
                  })}
                  <defs><marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" /></marker></defs>
                </svg>
              </div>
            </div>

            {result && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-6 max-h-[350px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-4"><span className="text-2xl">✅</span><h3 className="text-lg font-semibold">Workflow Executed</h3></div>
                <div className="grid grid-cols-3 gap-3 mb-4 text-center text-sm">
                  <div className="bg-slate-900 rounded p-2"><div className="font-bold">{result.results?.length || 0}</div><div className="text-xs text-slate-400">Nodes Run</div></div>
                  <div className="bg-slate-900 rounded p-2"><div className="font-bold">{result.stats?.providers?.join(', ') || '—'}</div><div className="text-xs text-slate-400">Providers</div></div>
                  <div className="bg-slate-900 rounded p-2"><div className="font-bold">{result.stats?.duration || '—'}</div><div className="text-xs text-slate-400">Duration</div></div>
                </div>
                {result.results?.map((r: any, i: number) => (
                  <details key={i} className="mb-2" open={i === 0}>
                    <summary className="cursor-pointer font-medium text-purple-400 text-sm">{r.type === 'input' ? '📥' : r.type === 'output' ? '📤' : '🤖'} {r.label || r.nodeId}</summary>
                    <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded">{r.output}</pre>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
