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

  const { hierarchyData, nodes, links } = useMemo(() => {
    const taskMap = new Map(allTasks.map(t => [t.id, { ...t, children: [] as any[] }]));

    const nodesData: any[] = [];
    const linksData: any[] = [];
    const roots: any[] = [];

    allTasks.forEach(task => {
        if (!taskMap.has(task.id)) return;
        
        nodesData.push({
            id: task.id,
            task: task,
        });

        if (task.dependencies && task.dependencies.length > 0) {
            task.dependencies.forEach(depId => {
                if (taskMap.has(depId)) {
                    linksData.push({
                        source: depId,
                        target: task.id,
                    });
                }
            });
        } else {
            roots.push(taskMap.get(task.id)!);
        }
    });
    
    if (nodesData.length === 0) {
      return { hierarchyData: null, nodes: [], links: [] };
    }

    const hierarchyRoot = d3.stratify()
        .id((d: any) => d.id)
        .parentId((d: any) => d.dependencies?.[0]) // Simplified for tree layout
        (allTasks.filter(t => t.dependencies?.length <= 1)); // d3.tree works best with single parent

    if(!hierarchyRoot) {
      const virtualRoot = { id: 'virtual-root', children: roots };
      const createdHierarchy = d3.hierarchy(virtualRoot);
       return { 
        hierarchyData: virtualRoot,
        nodes: createdHierarchy.descendants().slice(1), 
        links: createdHierarchy.links(),
      };
    }
    
    // Create tree layout
    const treeLayout = d3.tree<any>()
      .size([600, 800]) // height, width -> vertical tree
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    
    const treeData = treeLayout(hierarchyRoot);

    const treeNodes = treeData.descendants().map(d => ({
        ...d,
        // Swap x and y for horizontal layout
        x: d.y,
        y: d.x,
    }));
    
    const treeLinks = treeData.links().map(d => ({
      source: { ...d.source, x: d.source.y, y: d.source.x },
      target: { ...d.target, x: d.target.y, y: d.target.x }
    }));
    
    return { 
      hierarchyData: hierarchyRoot, 
      nodes: treeNodes, 
      links: treeLinks 
    };

  }, [tasks, allTasks]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(100, 0)`);

    const linkGenerator = d3.linkHorizontal()
      .x((d:any) => d.x)
      .y((d:any) => d.y);

    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
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
        setTaskToView(d.data.task || d.data);
      });

    node.append('rect')
      .attr('width', 160)
      .attr('height', 60)
      .attr('x', -80)
      .attr('y', -30)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', (d: any) => {
        const task = d.data.task || d.data;
        return statusColors[task.status] || statusColors.not_started;
       })
      .attr('stroke', (d: any) => {
        const task = d.data.task || d.data;
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
         const task = d.data.task || d.data;
         return priorityColors[task.priority] || priorityColors.low;
      });

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-8')
      .attr('fill', '#1e293b')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text((d: any) => {
        const task = d.data.task || d.data;
        const title = task.title;
        return title.length > 18 ? title.substring(0, 18) + '...' : title;
      });
      
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '8')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .text((d: any) => {
        const task = d.data.task || d.data;
        const status = task.status.replace('_', ' ');
        return status.charAt(0).toUpperCase() + status.slice(1);
      });

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '22')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .text((d: any) => {
        const task = d.data.task || d.data;
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          return format(dueDate, 'MMM dd');
        }
        return '';
      });

    node
      .filter((d: any) => {
        const task = d.data.task || d.data;
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < new Date() && task.status !== 'completed';
      })
      .append('circle')
      .attr('cx', 70)
      .attr('cy', -20)
      .attr('r', 6)
      .attr('fill', '#ef4444')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    node
      .filter((d: any) => {
        const task = d.data.task || d.data;
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < new Date() && task.status !== 'completed';
      })
      .append('text')
      .attr('x', 70)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('!');
      
    const zoom = d3.zoom()
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
        
        const { x, y, width, height } = bounds;
        
        const midX = x + width / 2;
        const midY = y + height / 2;

        if (width === 0 || height === 0) return;

        const scale = Math.min(fullWidth / width, fullHeight / height) * 0.8;
        const newX = fullWidth / 2 - scale * midX;
        const newY = fullHeight / 2 - scale * midY;
        
        svg.transition().duration(750).call(
            zoom.transform as any,
            d3.zoomIdentity.translate(newX, newY).scale(scale)
        );
    }
    
    svg.call(zoom as any);
    zoomToFit();
    
    svg.on('dblclick.zoom', () => zoomToFit());

  }, [nodes, links]);

  return (
    <Card className="shadow-lg mt-4 w-full h-[70vh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 relative">
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
    </Card>
  );
}
