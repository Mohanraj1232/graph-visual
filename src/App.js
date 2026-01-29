import { useState, useCallback, useRef } from "react";
import "@/App.css";
import { GraphCanvas } from "@/components/GraphCanvas";
import { ControlPanel } from "@/components/ControlPanel";
import { Toaster, toast } from "sonner";

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isDirected, setIsDirected] = useState(false);
  const [showWeights, setShowWeights] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const graphRef = useRef();

  const handleGenerateGraph = useCallback((data) => {
    setGraphData(data);
  }, []);

  const handleExport = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast.error('No graph to export');
      return;
    }

    try {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `graph-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Graph exported successfully!');
      });
    } catch (error) {
      toast.error('Failed to export graph');
      console.error(error);
    }
  }, []);

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node);
  }, []);

  const handleLinkHover = useCallback((link) => {
    setHoveredLink(link);
  }, []);

  return (
    <div className="App" data-testid="app-container">
      <Toaster 
        position="top-right" 
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            color: '#EDEDED',
          },
        }}
      />
      
      <GraphCanvas 
        ref={graphRef}
        graphData={graphData}
        isDirected={isDirected}
        showWeights={showWeights}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
      />
      
      <ControlPanel 
        onGenerateGraph={handleGenerateGraph}
        onExport={handleExport}
        isDirected={isDirected}
        setIsDirected={setIsDirected}
        showWeights={showWeights}
        setShowWeights={setShowWeights}
        hoveredNode={hoveredNode}
        hoveredLink={hoveredLink}
      />
    </div>
  );
}

export default App;
