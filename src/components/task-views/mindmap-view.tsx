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

export default function MindMapView({ tasks, allTasks }: MindMapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  const { nodes, links } = useMemo(() => {
    if (tasks.length === 0) {
      return { nodes: [], links: [] };
    }

    const taskMap = new Map(tasks.map(t => [t.id, { ...t, children: [] as any[] }]));
    const roots: any[] = [];

    tasks.forEach(task => {
        const taskNode = taskMap.get(task.id)!;
        if (!task.dependencies || task.dependencies.length === 0) {
            roots.push(taskNode);
        } else {
            task.dependencies.forEach(depId => {
                const parent = taskMap.get(depId);
                if (parent) {
                    parent.children.push(taskNode);
                } else {
                    // If parent is not in the filtered `tasks` list but exists in allTasks,
                    // it might be a root for the purpose of layout. Check if it has no dependencies.
                    const fullParentTask = allTasks.find(t => t.id === depId);
                    if (fullParentTask && (!fullParentTask.dependencies || fullParentTask.dependencies.length === 0)) {
                       roots.push(taskNode);
                    }
                }
            });
        }
    });

    const uniqueRoots = roots.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

    const virtualRoot = { id: 'virtual-root', children: uniqueRoots };
    const hierarchy = d3.hierarchy(virtualRoot);
    
    // Create tree layout
    const treeLayout = d3.tree<any>()
      .size([600, 800]) // height, width -> vertical tree
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2));
    
    const treeData = treeLayout(hierarchy);
    
    // We skip the virtual root node itself
    const treeNodes = treeData.descendants().slice(1).map(d => ({
        ...d,
        // Swap x and y for horizontal layout, and add some spacing
        x: d.y + 50,
        y: d.x,
    }));
    
    const treeLinks = treeData.links().filter(d => d.source.id !== 'virtual-root').map(d => ({
      source: { ...d.source, x: d.source.y + 50, y: d.source.x },
      target: { ...d.target, x: d.target.y + 50, y: d.target.x }
    }));
    
    return {
      nodes: treeNodes, 
      links: treeLinks 
    };

  }, [tasks, allTasks]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) {
      if(svgRef.current) d3.select(svgRef.current).selectAll('*').remove();
      return;
    };

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    svg.selectAll('*').remove();

    const g = svg.append('g');

    const linkGenerator = d3.linkHorizontal()
      .x((d:any) => d.x)
      .y((d:any) => d.y);

    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', (d:any) => linkGenerator({source: d.source, target: d.target}));

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', (d:any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        setTaskToView(d.data);
      });

    node.append('rect')
      .attr('width', 160)
      .attr('height', 60)
      .attr('x', -80)
      .attr('y', -30)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', (d: any) => {
        const task = d.data;
        return statusColors[task.status] || statusColors.not_started;
       })
      .attr('stroke', (d: any) => {
        const task = d.data;
        return statusBorders[task.status] || statusBorders.not_started;
      })
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
      
    node.append('rect')
      .attr('width', 4)
      .attr('height', 60)
      .attr('x', -80)
      .attr('y', -30)
      .attr('rx', 2)
      .attr('fill', (d: any) => {
         const task = d.data;
         return priorityColors[task.priority] || priorityColors.low;
      });

    const text = node.append('text')
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

    text.append('tspan')
      .attr('x', 0)
      .attr('dy', '1.2em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .text((d: any) => {
        if (d.data.dueDate) {
          const dueDate = new Date(d.data.dueDate);
          return format(dueDate, 'MMM dd');
        }
        return '';
      });

    node
      .filter((d: any) => {
        if (!d.data.dueDate) return false;
        const dueDate = new Date(d.data.dueDate);
        return dueDate < new Date() && d.data.status !== 'completed';
      })
      .append('circle')
      .attr('cx', 70)
      .attr('cy', -20)
      .attr('r', 6)
      .attr('fill', '#ef4444')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .append('title')
      .text('Overdue');
      
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    const zoomToFit = () => {
        const bounds = g.node()?.getBBox();
        if(!bounds) return;

        const parent = svg.node();
        if(!parent) return;

        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        
        const { x, y, width: boundsWidth, height: boundsHeight } = bounds;
        
        if (boundsWidth === 0 || boundsHeight === 0) return;

        const scale = Math.min(fullWidth / (boundsWidth + 100), fullHeight / (boundsHeight + 100)) * 0.9;
        const newX = fullWidth / 2 - scale * (x + boundsWidth / 2);
        const newY = fullHeight / 2 - scale * (y + boundsHeight / 2);
        
        svg.transition().duration(750).call(
            zoom.transform as any,
            d3.zoomIdentity.translate(newX, newY).scale(scale)
        );
    }
    
    svg.call(zoom);
    zoomToFit();
    
    svg.on('dblclick.zoom', () => zoomToFit());

  }, [nodes, links, tasks]);

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
                <div className="w-3 h-3 rounded bg-red-100 border border-red-500"></div>
                <span>Archived</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 mt-1 pt-1 border-t border-slate-200">
                <div className="w-2 h-3 rounded bg-red-500"></div>
                <span>High Priority</span>
                <div className="w-2 h-3 rounded bg-amber-400 ml-2"></div>
                <span>Medium</span>
                <div className="w-2 h-3 rounded bg-slate-200 ml-2"></div>
                <span>Low</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border">
            <p className="text-xs text-slate-600">Double-click to reset • Drag to pan • Scroll to zoom</p>
          </div>

          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border">
            <p className="text-sm font-medium text-slate-700">{nodes.length} Tasks</p>
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
