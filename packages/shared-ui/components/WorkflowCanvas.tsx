import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  Handle,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: 'input',
    type: 'inputNode',
    position: { x: 100, y: 100 },
    data: { label: 'Input' },
  },
];

const nodeTypes = {
  inputNode: ({ data }: { data: { label: string } }) => (
    <div className="rounded-lg bg-blue-600 px-4 py-2 text-white">
      <Handle type="source" position={Position.Bottom} />
      {data.label}
    </div>
  ),
  aiNode: ({ data }: { data: { label: string } }) => (
    <div className="rounded-lg bg-purple-600 px-4 py-2 text-white">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {data.label}
    </div>
  ),
  outputNode: ({ data }: { data: { label: string } }) => (
    <div className="rounded-lg bg-emerald-600 px-4 py-2 text-white">
      <Handle type="target" position={Position.Top} />
      {data.label}
    </div>
  ),
};

export function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="h-[600px] rounded-2xl border border-white/10 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
