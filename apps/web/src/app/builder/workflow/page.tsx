'use client';

import { useState } from 'react';
import Link from 'next/link';

interface WFNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; config?: any };
}
interface WFEdge { id: string; source: string; target: string; }

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<WFNode[]>([
    { id: 'input-1', type: 'input', position: { x: 100, y: 100 }, data: { label: 'Input' } }
  ]);
  const [edges, setEdges] = useState<WFEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedWorkflow, setSavedWorkflow] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);

  const addNode = (type: string) => {
    const newId = `${type}-${Date.now()}`;
    setNodes([...nodes, {
      id: newId, type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: type === 'ai' ? 'AI Process' : type === 'output' ? 'Output' : 'Node' }
    }]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    if (edges.some(e => e.source === sourceId && e.target === targetId)) return;
    setEdges([...edges, { id: `edge-${Date.now()}`, source: sourceId, target: targetId }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/workflow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, name: 'My Workflow' })
      });
      const data = await response.json();
      setSavedWorkflow(data);
      try {
        const history = JSON.parse(localStorage.getItem('triforce-history') || '[]');
        history.unshift({ id: data.workflowId, type: 'workflow', nodes: nodes.length, timestamp: new Date().toISOString(), status: 'completed' });
        localStorage.setItem('triforce-history', JSON.stringify(history.slice(0, 50)));
      } catch {}
    } catch (error) { console.error('Save error:', error); }
    finally { setSaving(false); }
  };

  // Feature 7: Workflow Export
  const handleExport = async (format: 'typescript' | 'python' | 'json' | 'yaml') => {
    setExporting(true);
    setExportResult(null);
    try {
      const response = await fetch('/api/export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, format })
      });
      const data = await response.json();
      if (data.code) {
        const blob = new Blob([data.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow.${format === 'typescript' ? 'ts' : format === 'python' ? 'py' : format}`;
        a.click();
        URL.revokeObjectURL(url);
        setExportResult(`Exported as ${format.toUpperCase()} ✓`);
      }
    } catch (error) { setExportResult('Export failed'); }
    finally { setExporting(false); }
  };

  const getNodeColor = (type: string) => {
    switch (type) { case 'input': return 'bg-blue-600'; case 'ai': return 'bg-purple-600'; case 'output': return 'bg-green-600'; default: return 'bg-slate-600'; }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">← Back to Builders</Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2">⚡ Workflow Builder</h1>
            <p className="text-xl text-slate-400">Design AI pipelines with multi-format export</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || nodes.length === 0}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold disabled:opacity-50">
              {saving ? 'Saving...' : '💾 Run Workflow'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Add Components</h3>
              <div className="space-y-2">
                <button onClick={() => addNode('input')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg">📥 Input Node</button>
                <button onClick={() => addNode('ai')} className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg">🤖 AI Process</button>
                <button onClick={() => addNode('output')} className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg">📤 Output Node</button>
              </div>
            </div>

            {/* Feature 7: Export Panel */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">📤 Export Workflow</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleExport('typescript')} disabled={exporting} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">TypeScript</button>
                <button onClick={() => handleExport('python')} disabled={exporting} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">Python</button>
                <button onClick={() => handleExport('json')} disabled={exporting} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">JSON</button>
                <button onClick={() => handleExport('yaml')} disabled={exporting} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">YAML</button>
              </div>
              {exportResult && <p className="mt-2 text-sm text-green-400">{exportResult}</p>}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Nodes:</span><span className="font-mono">{nodes.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Connections:</span><span className="font-mono">{edges.length}</span></div>
              </div>
            </div>

            {savedWorkflow && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><span>✅</span><h3 className="font-semibold">Workflow Executed</h3></div>
                <p className="text-xs text-slate-400 mb-2">ID: {savedWorkflow.workflowId}</p>
                {savedWorkflow.results && <p className="text-xs text-slate-400">{savedWorkflow.results.length} nodes processed</p>}
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-700 rounded-lg h-[600px] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="absolute inset-0">
                {nodes.map((node) => (
                  <div key={node.id} onClick={() => setSelectedNode(node.id)}
                    className={`absolute cursor-move select-none ${getNodeColor(node.type)} rounded-lg shadow-lg border-2 ${selectedNode === node.id ? 'border-white' : 'border-transparent'}`}
                    style={{ left: node.position.x, top: node.position.y, minWidth: '120px', padding: '12px 16px' }}>
                    <div className="font-medium text-sm">{node.data.label}</div>
                    {node.type !== 'input' && <div className="absolute -top-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); const t = prompt('Connect to node ID:'); if (t) connectNodes(t, node.id); }} />}
                    {node.type !== 'output' && <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); const t = prompt('Connect to node ID:'); if (t) connectNodes(node.id, t); }} />}
                    <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center hover:bg-red-500">×</button>
                  </div>
                ))}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                  {edges.map((edge) => {
                    const s = nodes.find(n => n.id === edge.source);
                    const t = nodes.find(n => n.id === edge.target);
                    if (!s || !t) return null;
                    return <line key={edge.id} x1={s.position.x + 60} y1={s.position.y + 60} x2={t.position.x + 60} y2={t.position.y} stroke="#a855f7" strokeWidth="2" />;
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
