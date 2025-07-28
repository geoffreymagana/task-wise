'use client';
import { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Task } from '@/lib/types';
import { Card } from '../ui/card';
import { TaskDetailsDialog } from '../task-manager/task-details-dialog';

interface MindMapViewProps {
  tasks: Task[];
  allTasks: Task[];
}

const statusColors = {
  not_started: '#9ca3af', // gray-400
  in_progress: '#3b82f6', // blue-500
  completed: '#22c55e',   // green-500
  archived: '#ef4444',    // red-500
};

export default function MindMapView({ tasks, allTasks }: MindMapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  const { nodes, links } = useMemo(() => {
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    const mindMapNodes = tasks.map(task => ({
      id: task.id,
      task: task,
    }));

    const mindMapLinks: { source: string; target: string; }[] = [];
    tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          if (taskMap.has(depId)) {
            mindMapLinks.push({ source: task.id, target: depId });
          }
        });
      }
    });

    return { nodes: mindMapNodes, links: mindMapLinks };
  }, [tasks, allTasks]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    svg.selectAll('*').remove(); // Clear previous render

    const g = svg.append('g');

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    const link = g
      .append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('stroke-width', 2)
      .attr('stroke', d => {
        const sourceNode = nodes.find(n => n.id === (d.source as any).id);
        return sourceNode?.task.color || '#9ca3af';
      })
      .attr('fill', 'none');

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation) as any)
      .on('click', (event, d) => {
        setTaskToView(d.task);
      });
      
    node.append('circle')
      .attr('r', 30)
      .attr('fill', (d) => statusColors[d.task.status] || '#9ca3af')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => d.task.title.substring(0, 10) + (d.task.title.length > 10 ? '...' : ''));

    const zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

    svg.call(zoom as any);

    simulation.on('tick', () => {
      link.attr('d', (d: any) => {
          const dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y;
          return `M${d.source.x},${d.source.y}C${d.source.x + dx / 2},${d.source.y} ${d.source.x + dx / 2},${d.target.y} ${d.target.x},${d.target.y}`;
      });

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  const drag = (simulation: d3.Simulation<any, any>) => {
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  };

  return (
    <Card className="shadow-lg mt-4 w-full h-[70vh] overflow-hidden">
      <svg ref={svgRef} className="w-full h-full"></svg>
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
