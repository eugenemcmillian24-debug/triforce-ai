'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; config?: any };
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'input-1', type: 'input', position: { x: 100, y: 100 }, data: { label: 'Input' } }
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedWorkflow, setSavedWorkflow] = useState<any>(null);

  const addNode = (type: string) => {
    const newId = `${type}-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: type === 'ai' ? 'AI Process' : type === 'output' ? 'Output' : 'Node' 
      }
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    if (edges.some(e => e.source === sourceId && e.target === targetId)) return;
    
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId
    };
    setEdges([...edges, newEdge]);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          name: 'My Workflow',
          description: 'Created with TriForce AI'
        })
      });

      const data = await response.json();
      setSavedWorkflow(data);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'input': return 'bg-blue-600';
      case 'ai': return 'bg-purple-600';
      case 'output': return 'bg-green-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">
          ← Back to Builders
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2">⚡ Workflow Builder</h1>
            <p className="text-xl text-slate-400">Design AI pipelines visually</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || nodes.length === 0}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Workflow'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Add Components</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addNode('input')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  <span>📥</span> Input Node
                </button>
                <button
                  onClick={() => addNode('ai')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg"
                >
                  <span>🤖</span> AI Process
                </button>
                <button
                  onClick={() => addNode('output')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg"
                >
                  <span>📤</span> Output Node
                </button>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Workflow Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nodes:</span>
                  <span className="font-mono">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connections:</span>
                  <span className="font-mono">{edges.length}</span>
                </div>
              </div>
            </div>

            {savedWorkflow && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>✅</span>
                  <h3 className="font-semibold">Workflow Saved</h3>
                </div>
                <p className="text-xs text-slate-400 mb-2">ID: {savedWorkflow.workflowId}</p>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-700 rounded-lg h-[600px] relative overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />

              {/* Nodes */}
              <div className="absolute inset-0">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`absolute cursor-move select-none ${getNodeColor(node.type)} rounded-lg shadow-lg border-2 ${
                      selectedNode === node.id ? 'border-white' : 'border-transparent'
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      minWidth: '120px',
                      padding: '12px 16px'
                    }}
                  >
                    <div className="font-medium text-sm">{node.data.label}</div>
                    
                    {/* Connection Points */}
                    {node.type !== 'input' && (
                      <div 
                        className="absolute -top-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          const target = prompt('Connect to node ID:');
                          if (target) connectNodes(target as string, node.id);
                        }}
                      />
                    )}
                    {node.type !== 'output' && (
                      <div 
                        className="absolute -bottom-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          const target = prompt('Connect to node ID:');
                          if (target) connectNodes(node.id, target as string);
                        }}
                      />
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center hover:bg-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Edges (SVG Lines) */}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                  {edges.map((edge) => {
                    const source = nodes.find(n => n.id === edge.source);
                    const target = nodes.find(n => n.id === edge.target);
                    if (!source || !target) return null;
                    
                    return (
                      <line
                        key={edge.id}
                        x1={source.position.x + 60}
                        y1={source.position.y + 60}
                        x2={target.position.x + 60}
                        y2={target.position.y}
                        stroke="#a855f7"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
