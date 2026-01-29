import { useRef, useEffect, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Default colors
const NODE_COLOR = '#00F0FF'; // Cyan - contrasts with white edges
const EDGE_COLOR = '#FFFFFF'; // White
const OUTGOING_EDGE_COLOR = '#00FF94'; // Green for outgoing edges (from hovered node)
const INCOMING_EDGE_COLOR = '#AA96DA'; // Light purple/lavender for incoming edges (to hovered node)

export const GraphCanvas = ({ 
  graphData, 
  isDirected,
  showWeights
}) => {
  const fgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  
  useEffect(() => {
    if (graphData.nodes.length > 0 && fgRef.current) {
      // Configure force simulation for spread out layout
      fgRef.current.d3Force('charge').strength(-300); // Strong repulsion between nodes
      fgRef.current.d3Force('link').distance(180); // Longer link distance
      
      // Zoom to fit after physics settles
      const timer = setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 100);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [graphData]);

  const handleNodeDrag = useCallback((node) => {
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  const handleNodeDragEnd = useCallback((node) => {
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  const handleNodeHoverLocal = useCallback((node) => {
    setHoveredNode(node);
  }, []);

  return (
    <div 
      data-testid="graph-canvas-container" 
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#050505"
        nodeColor={() => NODE_COLOR}
        linkColor={(link) => {
          // Highlight edges connected to hovered node with different colors for in/out
          if (hoveredNode) {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            // Outgoing edge: hovered node is the source
            if (sourceId === hoveredNode.id) {
              return OUTGOING_EDGE_COLOR;
            }
            // Incoming edge: hovered node is the target
            if (targetId === hoveredNode.id) {
              return INCOMING_EDGE_COLOR;
            }
          }
          return EDGE_COLOR;
        }}
        linkOpacity={0.6}
        linkWidth={(link) => {
          // Make connected edges thicker on hover
          if (hoveredNode) {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            if (sourceId === hoveredNode.id || targetId === hoveredNode.id) {
              return 5;
            }
          }
          return 2.5;
        }}
        linkDirectionalArrowLength={isDirected ? 12 : 0}
        linkDirectionalArrowRelPos={0.85}
        linkDirectionalArrowColor={(link) => {
          // Match arrow color with edge color
          if (hoveredNode) {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            // Outgoing edge: hovered node is the source
            if (sourceId === hoveredNode.id) {
              return OUTGOING_EDGE_COLOR;
            }
            // Incoming edge: hovered node is the target
            if (targetId === hoveredNode.id) {
              return INCOMING_EDGE_COLOR;
            }
          }
          return EDGE_COLOR;
        }}
        linkCanvasObjectMode={() => showWeights ? 'after' : undefined}
        linkCanvasObject={showWeights ? (link, ctx, globalScale) => {
          if (!link.weight) return;
          
          const label = link.weight.toString();
          const fontSize = 18/globalScale;
          ctx.font = `700 ${fontSize}px Arial, sans-serif`;
          
          // Calculate midpoint of the link
          const start = link.source;
          const end = link.target;
          const textPos = {
            x: start.x + (end.x - start.x) / 2,
            y: start.y + (end.y - start.y) / 2
          };
          
          // Draw weight text with shadow for visibility (no box)
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Dark shadow/outline for contrast
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = 3;
          ctx.strokeText(label, textPos.x, textPos.y);
          
          // White text
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(label, textPos.x, textPos.y);
        } : undefined}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const nodeRadius = 16;
          const fontSize = Math.min(14, nodeRadius * 1.2) / globalScale;
          const isHovered = hoveredNode && hoveredNode.id === node.id;
          
          // Draw hover glow effect
          if (isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius + 10, 0, 2 * Math.PI, false);
            ctx.fillStyle = NODE_COLOR + '25';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius + 6, 0, 2 * Math.PI, false);
            ctx.fillStyle = NODE_COLOR + '40';
            ctx.fill();
          }
          
          // Draw outer glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius + 3, 0, 2 * Math.PI, false);
          ctx.fillStyle = NODE_COLOR + '30';
          ctx.fill();
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
          ctx.fillStyle = NODE_COLOR;
          ctx.fill();
          
          // Draw node border
          ctx.strokeStyle = isHovered ? '#FFFFFF' : 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = isHovered ? 3 : 1.5;
          ctx.stroke();
          
          // Draw label inside node - clean and readable
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Draw dark text (contrasts with cyan node)
          ctx.fillStyle = '#000000';
          ctx.fillText(label, node.x, node.y);
        }}
        onNodeDrag={handleNodeDrag}
        onNodeDragEnd={handleNodeDragEnd}
        onNodeHover={handleNodeHoverLocal}
        cooldownTime={4000}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.2}
        d3AlphaMin={0.001}
        linkDistance={120}
        nodeRelSize={8}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
};
