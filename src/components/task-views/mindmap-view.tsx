'use client';
import { useCallback, useLayoutEffect, useState } from 'react';
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
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { Task } from '@/lib/types';
import { Card } from '../ui/card';
import { Icon } from '../common/icon';
import { Badge } from '../ui/badge';
import { TaskDetailsDialog } from '../task-manager/task-details-dialog';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { LayoutDashboard } from 'lucide-react';
import { startOfDay, format } from 'date-fns';

const elk = new ELK();

const nodeWidth = 200;
const nodeHeight = 100;

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'elk.spacing.nodeNode': '60',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], options = {}) => {
  const graph = {
    id: 'root',
    layoutOptions: { ...elkOptions, ...options },
    children: nodes,
    edges: edges,
  };

  return elk.layout(graph).then((layoutedGraph) => ({
    nodes: layoutedGraph.children?.flatMap((node: any) => {
        if (node.children) { // It's a group node
            return [
                {
                    ...node,
                    position: { x: node.x!, y: node.y! },
                },
                ...node.children.map((child: any) => ({
                    ...child,
                    position: { x: node.x! + child.x!, y: node.y! + child.y! },
                })),
            ];
        }
        return {
            ...node,
            position: { x: node.x!, y: node.y! },
        };
    }) || [],
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
        <div className="flex items-center gap-2 mb-1">
            <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: data.color }}
            >
                <Icon name={data.icon || 'Package'} className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-left break-words w-full" title={data.title}>
                {data.title}
            </div>
        </div>

        <Badge variant="secondary" className="mt-1 text-xs capitalize">
            {data.status.replace('_', ' ')}
        </Badge>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function DateNode({data}) {
    return (
        <div className="p-2 rounded-lg bg-primary/10 text-primary-foreground font-bold font-headline text-lg">
            <h3>{data.label}</h3>
        </div>
    )
}

const nodeTypes = {
  taskNode: TaskNode,
  dateNode: DateNode,
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
    if (node.type === 'taskNode') {
      const task = allTasks.find(t => t.id === node.id);
      if(task) setTaskToView(task);
    }
  };

  const onLayout = useCallback(() => {
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const groupedByDate = tasks.reduce((acc, task) => {
      const dateKey = format(startOfDay(new Date(task.createdAt)), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    Object.entries(groupedByDate).forEach(([dateStr, tasksInDay]) => {
      const dateNodeId = `date-${dateStr}`;
      initialNodes.push({
        id: dateNodeId,
        type: 'dateNode',
        data: { label: format(new Date(dateStr), 'PPP') },
        position: { x: 0, y: 0 },
        width: 220,
        height: 50,
      });

      tasksInDay.forEach(task => {
        initialNodes.push({
          id: task.id,
          type: 'taskNode',
          data: task,
          position: { x: 0, y: 0 },
          width: nodeWidth,
          height: nodeHeight,
        });

        // Edges from dependencies
        if (task.dependencies?.length) {
          task.dependencies.forEach(depId => {
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
        } else {
            // Edge from date node if no other dependency
            initialEdges.push({
                id: `e-${dateNodeId}-${task.id}`,
                source: dateNodeId,
                target: task.id,
                type: 'smoothstep',
            });
        }
      });
    });

    getLayoutedElements(initialNodes, initialEdges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes as Node[]);
      setEdges(layoutedEdges as Edge[]);
    });
  }, [tasks]);

  useLayoutEffect(() => {
    onLayout();
  }, [tasks, onLayout]);

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
            <Panel position="top-right">
                <Button variant="outline" size="icon" onClick={onLayout}>
                    <LayoutDashboard className="h-4 w-4"/>
                </Button>
            </Panel>
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
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
