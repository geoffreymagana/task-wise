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
    
    const d3Nodes = tasks.map(task => ({
      id: task.id,
      ...task
    }));

    const d3Links: { source: string; target: string; }[] = [];
    tasks.forEach(task => {
        if (task.dependencies) {
            task.dependencies.forEach(depId => {
                // Ensure both source and target nodes are in the current filtered view
                if (taskMap.has(depId) && taskMap.has(task.id)) {
                    d3Links.push({ source: depId, target: task.id });
                }
            });
        }
    });
    
    return {
      nodes: d3Nodes, 
      links: d3Links 
    };

  }, [tasks]);

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
    
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(180).strength(0.5))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(85).strength(0.7));

    const link = g.append('g')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        if (event.defaultPrevented) return; // ignore click if drag occurred
        setTaskToView(d);
      });
      
    // Drag functionality
    const drag = d3.drag()
        .on("start", (event, d:any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (event, d:any) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on("end", (event, d:any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });
    
    node.call(drag as any);

    node.append('rect')
      .attr('width', 160)
      .attr('height', 60)
      .attr('x', -80)
      .attr('y', -30)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', (d: any) => statusColors[d.status] || statusColors.not_started)
      .attr('stroke', (d: any) => statusBorders[d.status] || statusBorders.not_started)
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
      
    node.append('rect')
      .attr('width', 4)
      .attr('height', 60)
      .attr('x', -80)
      .attr('y', -30)
      .attr('rx', 2)
      .attr('fill', (d: any) => priorityColors[d.priority] || priorityColors.low);

    const text = node.append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#1e293b')
      .style('pointer-events', 'none');

    text.append('tspan')
      .attr('dy', '-0.5em')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text((d: any) => {
        const title = d.title;
        return title.length > 18 ? title.substring(0, 18) + '...' : title;
      });
      
    text.append('tspan')
      .attr('x', 0)
      .attr('dy', '1.2em')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .text((d: any) => {
        const status = d.status.replace('_', ' ');
        return status.charAt(0).toUpperCase() + status.slice(1);
      });

    text.append('tspan')
      .attr('x', 0)
      .attr('dy', '1.2em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .text((d: any) => {
        if (d.dueDate) {
          try {
            const dueDate = new Date(d.dueDate);
            return format(dueDate, 'MMM dd');
          } catch(e) { return '' }
        }
        return '';
      });
      
    node
      .filter((d: any) => {
        if (!d.dueDate) return false;
        const dueDate = new Date(d.dueDate);
        return dueDate < new Date() && d.status !== 'completed';
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
      
    simulation.on("tick", () => {
        link
            .attr("x1", (d:any) => d.source.x)
            .attr("y1", (d:any) => d.source.y)
            .attr("x2", (d:any) => d.target.x)
            .attr("y2", (d:any) => d.target.y);

        node
            .attr("transform", (d:any) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);

    svg.on('dblclick.zoom', () => {
        const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(1);
        svg.transition().duration(750).call(zoom.transform as any, transform);
    });

  }, [nodes, links]);

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
