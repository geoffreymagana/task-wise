'use client';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { Task } from '@/lib/types';
import { Card } from '../ui/card';
import { Icon } from '../common/icon';
import { Badge } from '../ui/badge';
import { TaskDetailsDialog } from '../task-manager/task-details-dialog';
import { cn } from '@/lib/utils';

const elk = new ELK();

const nodeWidth = 180;
const nodeHeight = 80;

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], options = {}) => {
  const graph = {
    id: 'root',
    layoutOptions: { ...elkOptions, ...options },
    children: nodes.map((node) => ({
      ...node,
      width: nodeWidth,
      height: nodeHeight,
    })),
    edges: edges,
  };

  return elk.layout(graph).then((layoutedGraph) => ({
    nodes: layoutedGraph.children!.map((node) => ({
      ...node,
      position: { x: node.x!, y: node.y! },
    })),
    edges: layoutedGraph.edges || [],
  }));
};

const statusStyles = {
    not_started: 'bg-slate-50 border-slate-400',
    in_progress: 'bg-blue-100 border-blue-500',
    completed: 'bg-green-100 border-green-500',
    archived: 'bg-red-100 border-red-500',
};

const priorityStyles = {
  low: 'border-l-slate-300',
  medium: 'border-l-amber-400',
  high: 'border-l-red-500',
};

function TaskNode({ data }: { data: Task }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div 
        className={cn(
          'w-full h-full p-2 rounded-md shadow-md flex flex-col justify-center items-center text-center',
          'border-2 border-l-8',
          statusStyles[data.status] || statusStyles.not_started,
          priorityStyles[data.priority] || priorityStyles.medium,
        )}
      >
        <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
            style={{ backgroundColor: data.color }}
        >
            <Icon name={data.icon || 'Package'} className="w-5 h-5 text-white" />
        </div>
        <div className="text-sm font-semibold truncate w-full" title={data.title}>
            {data.title}
        </div>
        <Badge variant="secondary" className="mt-1 text-xs capitalize">
            {data.status.replace('_', ' ')}
        </Badge>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

const nodeTypes = {
  taskNode: TaskNode,
};

interface MindMapViewProps {
  tasks: Task[];
  allTasks: Task[];
}

export default function MindMapView({ tasks, allTasks }: MindMapViewProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    const task = allTasks.find(t => t.id === node.id);
    if(task) setTaskToView(task);
  };

  useLayoutEffect(() => {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    const initialNodes: Node[] = tasks.map(task => ({
      id: task.id,
      type: 'taskNode',
      data: task,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    }));

    const initialEdges: Edge[] = [];
    tasks.forEach(task => {
      if (task.dependencies?.length) {
        task.dependencies.forEach(depId => {
          // Only create an edge if the dependency is also in the filtered tasks
          if (taskMap.has(depId)) {
            initialEdges.push({
              id: `e-${depId}-${task.id}`,
              source: depId,
              target: task.id,
              type: 'smoothstep',
              animated: task.status === 'in_progress'
            });
          }
        });
      }
    });

    getLayoutedElements(initialNodes, initialEdges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges as Edge[]);
    });
  }, [tasks]);

  return (
    <Card className="shadow-lg mt-4 w-full h-[70vh] overflow-hidden relative">
      {tasks.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Add tasks with dependencies to see the mind map.</p>
        </div>
      ) : (
        <>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            className="bg-gradient-to-br from-slate-50 to-blue-50"
          >
            <Controls />
            <Background gap={24} />
          </ReactFlow>
          {taskToView && (
            <TaskDetailsDialog
              task={taskToView}
              allTasks={allTasks}
              onOpenChange={() => setTaskToView(null)}
            />
          )}
        </>
      )}
    </Card>
  );
}
