'use client';
import { useCallback, useLayoutEffect, useState, useEffect } from 'react';
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
  useReactFlow,
  ReactFlowProvider,
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
import { LayoutDashboard, ZoomIn, ZoomOut, Maximize, ArrowRightLeft, Lock, Unlock } from 'lucide-react';
import { startOfDay, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const elk = new ELK();

const nodeWidth = 220;
const nodeHeight = 80;

const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '120',
    'elk.spacing.nodeNode': '100',
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
};


const getLayoutedElements = (nodes: Node[], edges: Edge[], options = {}) => {
  const graph = {
    id: 'root',
    layoutOptions: { ...elkOptions, ...options},
    children: nodes.map(n => ({...n, width: n.width || nodeWidth, height: n.height || nodeHeight})),
    edges: edges,
  };

  return elk.layout(graph).then((layoutedGraph) => ({
    nodes: layoutedGraph.children?.map((node: any) => ({
      ...node,
      position: { x: node.x, y: node.y },
    })) || [],
    edges: layoutedGraph.edges || [],
  }));
};

const statusStyles = {
  not_started: 'bg-slate-50 border-slate-400',
  in_progress: 'bg-blue-100 border-blue-500',
  completed: 'bg-green-100 border-green-500',
  archived: 'bg-red-100 border-red-500',
};

const priorityStyles: Record<string, {node: string, edge: string}> = {
  low: { node: 'bg-slate-100 border-slate-400', edge: '#64748b' },
  medium: { node: 'bg-amber-100 border-amber-500', edge: '#f59e0b' },
  high: { node: 'bg-red-100 border-red-500', edge: '#ef4444' },
};

function TaskNode({ data }: { data: Task }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className={cn(
          'w-full h-full p-3 rounded-md shadow-md flex flex-col justify-center items-start text-left',
          'border-2 border-l-8',
          statusStyles[data.status] || statusStyles.not_started,
           (priorityStyles[data.priority]?.node || 'border-l-slate-400').replace(/border-\w+-\d+/g, (match) => `border-l-${match.split('-')[1]}-${match.split('-')[2]}`)
        )}
      >
        <div className="flex items-center gap-2 mb-1 w-full">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: data.color }}
          >
            <Icon name={data.icon || 'Package'} className="w-5 h-5 text-white" />
          </div>
          <div className="text-sm font-semibold break-words w-full text-slate-900" title={data.title}>
            {data.title}
          </div>
        </div>
        <Badge variant={data.status === 'completed' ? 'default' : 'secondary'} className={cn('mt-1 text-xs capitalize', {
          'bg-green-500 text-white': data.status === 'completed'
        })}>
          {data.status.replace('_', ' ')}
        </Badge>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function DateNode({ data }: { data: { label: string } }) {
  return (
    <div className="p-2 rounded-lg bg-primary text-primary-foreground font-bold font-headline text-lg shadow-md">
      <h3>{data.label}</h3>
    </div>
  );
}

const nodeTypes = {
  taskNode: TaskNode,
  dateNode: DateNode,
};

function CustomControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        document.dispatchEvent(new CustomEvent('lockchange', { detail: isLocked }));
    }, [isLocked]);

    const onLayout = () => {
        document.dispatchEvent(new CustomEvent('relayout'));
    };
    
    const onToggleLayout = () => {
        document.dispatchEvent(new Event('togglelayout'));
    }

    return (
        <Panel position="top-right">
             <TooltipProvider>
                <div className="flex gap-2 p-1 bg-background border rounded-lg shadow-md">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onToggleLayout()}>
                                <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Toggle Layout (H/V)</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onLayout()}>
                                <LayoutDashboard className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Auto Layout</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => zoomIn({duration: 300})}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom In</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => zoomOut({duration: 300})}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom Out</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={() => fitView({duration: 300, padding: 0.1})}>
                                <Maximize className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Fit View</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={() => setIsLocked(l => !l)}>
                                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isLocked ? 'Unlock' : 'Lock'} View</p></TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </Panel>
    );
}

interface MindMapViewProps {
  tasks: Task[];
  allTasks: Task[];
}


function FlowCanvas({ tasks, allTasks }: MindMapViewProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [layoutDirection, setLayoutDirection] = useState<'RIGHT' | 'DOWN'>('RIGHT');
  const [isViewLocked, setIsViewLocked] = useState(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const { fitView } = useReactFlow();

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
      const task = allTasks.find((t) => t.id === node.id);
      if (task) setTaskToView(task);
    } else if (node.type === 'dateNode') {
        const dateKey = node.id.replace('date-', '');
        setActiveDate(current => current === dateKey ? null : dateKey);
    }
  };

  const doLayout = useCallback(() => {
    const taskMap = new Map(allTasks.map((t) => [t.id, t]));
    
    let tasksToDisplay: Task[];
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    if (activeDate) {
        tasksToDisplay = tasks.filter(task => format(startOfDay(new Date(task.createdAt)), 'yyyy-MM-dd') === activeDate);
        
        const groupedByPriority = tasksToDisplay.reduce((acc, task) => {
            const priority = task.priority;
            if (!acc[priority]) acc[priority] = [];
            acc[priority].push(task);
            return acc;
        }, {} as Record<string, Task[]>);

        const dateNodeId = `date-${activeDate}`;
        initialNodes.push({
            id: dateNodeId,
            type: 'dateNode',
            data: { label: format(new Date(activeDate), 'PPP') },
            position: { x: 0, y: 0 },
            width: 200,
            height: 50,
        });

        for (const priority in groupedByPriority) {
            const priorityNodeId = `priority-${activeDate}-${priority}`;
            const priorityStyle = priorityStyles[priority];

            initialNodes.push({
                id: priorityNodeId,
                type: 'default',
                data: { label: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority` },
                position: { x: 0, y: 0 },
                style: { 
                    backgroundColor: priorityStyle.node.split(' ')[0], 
                    border: `2px solid ${priorityStyle.node.split(' ')[1]}`,
                    borderRadius: 8,
                    color: '#1e293b',
                    fontWeight: 'bold',
                },
                width: 180,
                height: 40,
            });
            initialEdges.push({
                id: `e-${dateNodeId}-${priorityNodeId}`,
                source: dateNodeId,
                target: priorityNodeId,
                type: 'smoothstep',
                style: { stroke: priorityStyle.edge, strokeWidth: 2.5 },
            });
            
            const tasksInPriority = groupedByPriority[priority];
            for (const task of tasksInPriority) {
                 initialNodes.push({
                    id: task.id,
                    type: 'taskNode',
                    data: task,
                    position: { x: 0, y: 0 },
                    width: nodeWidth,
                    height: nodeHeight,
                });
                
                if (!task.dependencies?.length || !task.dependencies.some(depId => tasksToDisplay.some(t => t.id === depId))) {
                    initialEdges.push({
                        id: `e-${priorityNodeId}-${task.id}`,
                        source: priorityNodeId,
                        target: task.id,
                        type: 'smoothstep',
                        style: { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '5,5' },
                    });
                }
                
                if (task.dependencies?.length) {
                     task.dependencies.forEach(depId => {
                      if (tasksToDisplay.some(t => t.id === depId)) {
                        initialEdges.push({
                          id: `e-${depId}-${task.id}`,
                          source: depId,
                          target: task.id,
                          type: 'smoothstep',
                          animated: task.status === 'in_progress',
                          style: { stroke: taskMap.get(depId)?.color || '#334155', strokeWidth: 2 },
                        });
                      }
                    });
                }
            }
        }
    } else {
        const groupedByDate = tasks.reduce((acc, task) => {
            const dateKey = format(startOfDay(new Date(task.createdAt)), 'yyyy-MM-dd');
            if (!acc.includes(dateKey)) {
                acc.push(dateKey);
            }
            return acc;
        }, [] as string[]);
        
        groupedByDate.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).forEach(dateKey => {
            initialNodes.push({
                id: `date-${dateKey}`,
                type: 'dateNode',
                data: { label: format(new Date(dateKey), 'PPP') },
                position: { x: 0, y: 0 },
                width: 200,
                height: 50,
            });
        });
    }

    if (initialNodes.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
    }
    
    getLayoutedElements(initialNodes, initialEdges, { 'elk.direction': layoutDirection }).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setTimeout(() => fitView({ duration: 500, padding: 0.1 }), 100);
    });
  }, [tasks, allTasks, layoutDirection, fitView, activeDate]);


  useEffect(() => {
    doLayout();
  }, [tasks, layoutDirection, activeDate, doLayout]);

  useLayoutEffect(() => {
    const handleRelayout = () => doLayout();
    const handleToggleLayout = () => {
        setLayoutDirection(prev => prev === 'RIGHT' ? 'DOWN' : 'RIGHT');
    };
    const handleLockChange = (e: CustomEvent) => {
        setIsViewLocked(e.detail);
    };
    
    document.addEventListener('relayout', handleRelayout);
    document.addEventListener('togglelayout', handleToggleLayout);
    document.addEventListener('lockchange', handleLockChange as EventListener);

    return () => {
        document.removeEventListener('relayout', handleRelayout);
        document.removeEventListener('togglelayout', handleToggleLayout);
        document.removeEventListener('lockchange', handleLockChange as EventListener);
    };
  }, [doLayout]);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      className="bg-gradient-to-br from-background to-muted/50"
      panOnDrag={!isViewLocked}
      zoomOnScroll={!isViewLocked}
      zoomOnDoubleClick={!isViewLocked}
      zoomOnPinch={!isViewLocked}
      nodesDraggable={!isViewLocked}
      minZoom={0.1}
    >
      <CustomControls />
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
      <Background gap={24} />
      {taskToView && (
        <TaskDetailsDialog
          task={taskToView}
          allTasks={allTasks}
          onOpenChange={() => setTaskToView(null)}
        />
      )}
    </ReactFlow>
  );
}

export default function MindMapView(props: MindMapViewProps) {
  return (
    <Card className="shadow-lg mt-4 w-full h-[70vh] overflow-hidden relative">
      {props.tasks.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Add tasks to see the mind map.</p>
        </div>
      ) : (
        <ReactFlowProvider>
          <FlowCanvas {...props} />
        </ReactFlowProvider>
      )}
    </Card>
  );
}
