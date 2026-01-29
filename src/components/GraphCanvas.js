import { useRef, useEffect, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Default colors
const NODE_COLOR = '#00F0FF'; // Cyan - contrasts with white edges
const EDGE_COLOR = '#FFFFFF'; // White
const HOVER_EDGE_COLOR = '#FFD600'; // Yellow for highlighted edges

export const GraphCanvas = ({ 
  graphData, 
  isDirected,
  showWeights,
  onNodeHover,
  onLinkHover 
}) => {
  const fgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      // Zoom to fit on data change with a delay to allow physics to settle
      const timer = setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 80);
        }
      }, 100);
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
    onNodeHover(node);
  }, [onNodeHover]);

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
          // Highlight edges connected to hovered node
          if (hoveredNode) {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            if (sourceId === hoveredNode.id || targetId === hoveredNode.id) {
              return HOVER_EDGE_COLOR;
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
        linkDirectionalArrowLength={isDirected ? 8 : 0}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={isDirected ? 3 : 0}
        linkDirectionalParticleWidth={3}
        linkCanvasObjectMode={() => showWeights ? 'after' : undefined}
        linkCanvasObject={showWeights ? (link, ctx, globalScale) => {
          if (!link.weight) return;
          
          const label = link.weight.toString();
          const fontSize = 14/globalScale;
          ctx.font = `800 ${fontSize}px 'Space Grotesk', sans-serif`;
          
          // Calculate midpoint of the link
          const start = link.source;
          const end = link.target;
          const textPos = {
            x: start.x + (end.x - start.x) / 2,
            y: start.y + (end.y - start.y) / 2
          };
          
          // Draw background box for weight
          const textWidth = ctx.measureText(label).width;
          const padding = 4;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(
            textPos.x - textWidth / 2 - padding,
            textPos.y - fontSize / 2 - padding,
            textWidth + padding * 2,
            fontSize + padding * 2
          );
          
          // Draw border
          ctx.strokeStyle = NODE_COLOR;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(
            textPos.x - textWidth / 2 - padding,
            textPos.y - fontSize / 2 - padding,
            textWidth + padding * 2,
            fontSize + padding * 2
          );
          
          // Draw weight text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(label, textPos.x, textPos.y);
        } : undefined}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 16/globalScale;
          const nodeRadius = 12;
          const isHovered = hoveredNode && hoveredNode.id === node.id;
          
          // Draw hover glow effect
          if (isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius + 8, 0, 2 * Math.PI, false);
            ctx.fillStyle = NODE_COLOR + '30';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius + 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = NODE_COLOR + '50';
            ctx.fill();
          }
          
          // Draw outer glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius + 2, 0, 2 * Math.PI, false);
          ctx.fillStyle = NODE_COLOR + '40';
          ctx.fill();
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
          ctx.fillStyle = NODE_COLOR;
          ctx.fill();
          
          // Draw hover border
          if (isHovered) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
          
          // Draw label inside node - bold and clear
          ctx.font = `900 ${fontSize}px 'Arial Black', 'Space Grotesk', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Draw dark outline for contrast
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeText(label, node.x, node.y);
          
          // Draw white bold text
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(label, node.x, node.y);
        }}
        onNodeDrag={handleNodeDrag}
        onNodeDragEnd={handleNodeDragEnd}
        onNodeHover={handleNodeHoverLocal}
        onLinkHover={onLinkHover}
        cooldownTime={3000}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
};
