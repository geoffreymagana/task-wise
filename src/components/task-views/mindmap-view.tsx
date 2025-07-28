'use client';
import { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Task } from '@/lib/types';
import { Card } from '../ui/card';
import { TaskDetailsDialog } from '../task-manager/task-details-dialog';
import { format } from 'date-fns';

interface MindMapViewProps {
  tasks: Task[];
  allTasks: Task[];
}

const statusColors = {
  not_started: '#f8fafc', // slate-50
  in_progress: '#dbeafe', // blue-100
  completed: '#dcfce7',   // green-100
  archived: '#fee2e2',    // red-100
};

const statusBorders = {
  not_started: '#94a3b8', // slate-400
  in_progress: '#3b82f6', // blue-500
  completed: '#22c55e',   // green-500
  archived: '#ef4444',    // red-500
};

const priorityColors = {
  low: '#e2e8f0',     // slate-200
  medium: '#fbbf24',  // amber-400
  high: '#ef4444',    // red-500
};

interface HierarchyNode extends Task {
    children?: HierarchyNode[];
}

export default function MindMapView({ tasks, allTasks }: MindMapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  const { root, nodes, links } = useMemo(() => {
    if (tasks.length === 0) {
      return { root: null, nodes: [], links: [] };
    }

    const taskMap = new Map(tasks.map(t => [t.id, { ...t, children: [] as HierarchyNode[] } as HierarchyNode]));
    
    const roots: HierarchyNode[] = [];
    
    tasks.forEach(task => {
        const node = taskMap.get(task.id)!;
        if (task.dependencies && task.dependencies.length > 0) {
            task.dependencies.forEach(depId => {
                const parent = taskMap.get(depId);
                // Check if the parent is in the current filtered view
                if (parent) {
                    parent.children.push(node);
                }
            });
        }
    });

    tasks.forEach(task => {
        const isChild = tasks.some(t => t.dependencies?.includes(task.id));
        const hasNoDependenciesInView = !task.dependencies || task.dependencies.every(depId => !taskMap.has(depId));
        if (hasNoDependenciesInView && !isChild) {
             const node = taskMap.get(task.id);
             if(node) roots.push(node);
        }
    });

    // Group roots by creation date
    const groupedByDate: { [key: string]: HierarchyNode[] } = {};
    roots.forEach(root => {
        const dateStr = format(new Date(root.createdAt), 'yyyy-MM-dd');
        if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = [];
        }
        groupedByDate[dateStr].push(root);
    });

    // Create a hierarchical structure with dates as parents
    const dateNodes = Object.entries(groupedByDate).map(([date, children]) => ({
        id: `date-${date}`,
        title: format(new Date(date), 'MMMM d, yyyy'),
        createdAt: date,
        children,
    }));

    // Create a single virtual root
    const virtualRoot = { id: 'root', title: 'Task Plan', children: dateNodes, createdAt: new Date().toISOString() };
    
    const hierarchy = d3.hierarchy(virtualRoot);
    const treeLayout = d3.tree().nodeSize([100, 250]);
    const treeData = treeLayout(hierarchy);
    
    const d3Nodes = treeData.descendants();
    const d3Links = treeData.links();

    return {
      root: treeData, 
      nodes: d3Nodes, 
      links: d3Links 
    };

  }, [tasks]);

  useEffect(() => {
    if (!svgRef.current || !root ) {
      if(svgRef.current) d3.select(svgRef.current).selectAll('*').remove();
      return;
    };

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('g.content');
    
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    svg.selectAll('*').remove();

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        contentGroup.attr('transform', event.transform);
      });
      
    svg.call(zoom);

    const contentGroup = svg.append('g').attr('class', 'content');
    
    const linkGenerator = d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x);

    // Links
    contentGroup.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', linkGenerator as any);

    // Nodes
    const node = contentGroup.append('g')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.on('click', (event, d: any) => {
        if(d.data.id && d.data.id.startsWith('date-')) return;
        if(d.data.id === 'root') return;
        setTaskToView(d.data as Task);
    });

    // Node content
    node.each(function(d) {
        const group = d3.select(this);
        const isDateNode = d.data.id.startsWith('date-');
        const isRootNode = d.data.id === 'root';

        if (isRootNode) {
            group.append('circle')
                .attr('r', 15)
                .attr('fill', 'hsl(var(--primary))');
            group.append('text')
                .attr('dy', '0.31em')
                .attr('x', 20)
                .attr('font-size', '16px')
                .attr('font-weight', 'bold')
                .text(d.data.title);
        } else if (isDateNode) {
            group.append('rect')
                .attr('width', 180)
                .attr('height', 40)
                .attr('x', -90)
                .attr('y', -20)
                .attr('rx', 8)
                .attr('ry', 8)
                .attr('fill', 'hsl(var(--muted))');
            group.append('text')
                .attr('dy', '0.31em')
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', '500')
                .text(d.data.title);
        } else { // Task node
            group.append('rect')
                .attr('width', 160)
                .attr('height', 60)
                .attr('x', -80)
                .attr('y', -30)
                .attr('rx', 8)
                .attr('ry', 8)
                .attr('fill', (d: any) => statusColors[d.data.status] || statusColors.not_started)
                .attr('stroke', (d: any) => statusBorders[d.data.status] || statusBorders.not_started)
                .attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
              
            group.append('rect')
                .attr('width', 4)
                .attr('height', 60)
                .attr('x', -80)
                .attr('y', -30)
                .attr('rx', 2)
                .attr('fill', (d: any) => priorityColors[d.data.priority] || priorityColors.low);

            const text = group.append('text')
                .attr('text-anchor', 'middle')
                .attr('fill', '#1e293b')
                .style('pointer-events', 'none');

            text.append('tspan')
                .attr('dy', '-0.5em')
                .attr('font-size', '13px')
                .attr('font-weight', '600')
                .text((d: any) => {
                    const title = d.data.title;
                    return title.length > 18 ? title.substring(0, 18) + '...' : title;
                });
              
            text.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .attr('fill', '#64748b')
                .attr('font-size', '11px')
                .text((d: any) => {
                    const status = d.data.status.replace('_', ' ');
                    return status.charAt(0).toUpperCase() + status.slice(1);
                });
        }
    });

    const initialX = width / 2 - (root.y + 100);
    const initialY = height / 2 - root.x;
    const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(0.8);

    svg.call(zoom.transform as any, initialTransform);
    
  }, [root, nodes, links]);

  return (
    <Card className="shadow-lg mt-4 w-full h-[70vh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 relative">
       {tasks.length === 0 ? (
         <div className="flex items-center justify-center h-full">
           <p className="text-muted-foreground">Add tasks with dependencies to see the mind map.</p>
         </div>
        ) : (
        <>
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Task Flow</h4>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-50 border border-slate-400"></div>
                <span>Not Started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-500"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-500"></div>
                <span>Completed</span>
              </div>
               <div className="flex items-center gap-2">
                <div className="w-2 h-3 rounded bg-red-500"></div>
                <span>High Prio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-3 rounded bg-amber-400"></div>
                <span>Medium Prio</span>
              </div>
               <div className="flex items-center gap-2">
                <div className="w-2 h-3 rounded bg-slate-200"></div>
                <span>Low Prio</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border">
            <p className="text-xs text-slate-600">Scroll to zoom • Drag to pan</p>
          </div>

          <svg ref={svgRef} className="w-full h-full cursor-move"></svg>
          
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
