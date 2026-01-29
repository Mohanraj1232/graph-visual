import { useState } from 'react';
import { ZoomIn, ZoomOut, Download, RefreshCw, CircleDot, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

export const ControlPanel = ({ 
  onGenerateGraph, 
  onExport, 
  isDirected, 
  setIsDirected,
  showWeights,
  setShowWeights
}) => {
  const [graphInput, setGraphInput] = useState('');

  const handleGenerate = () => {
    if (!graphInput.trim()) {
      toast.error('Please enter graph data');
      return;
    }

    const lines = graphInput.trim().split('\n');
    
    if (lines.length < 1) {
      toast.error('Input must have at least one line');
      return;
    }

    // Parse first line: vertices edges
    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2) {
      toast.error('First line must contain: num_vertices num_edges');
      return;
    }

    const vertices = parseInt(firstLine[0]);
    const edges = parseInt(firstLine[1]);

    if (isNaN(vertices) || vertices <= 0) {
      toast.error('Invalid number of vertices');
      return;
    }

    if (isNaN(edges) || edges < 0) {
      toast.error('Invalid number of edges');
      return;
    }

    // Parse edge lines
    const parsedEdges = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(/\s+/);
      if (parts.length < 2) {
        toast.error(`Invalid edge format at line ${i + 1}: "${line}"`);
        return;
      }
      
      const edge = {
        source: parts[0],
        target: parts[1]
      };
      
      // Check for weight (third parameter)
      if (parts.length >= 3) {
        const weight = parseFloat(parts[2]);
        if (!isNaN(weight)) {
          edge.weight = weight;
        }
      }
      
      parsedEdges.push(edge);
    }

    if (parsedEdges.length !== edges) {
      toast.warning(`Expected ${edges} edges, found ${parsedEdges.length}`);
    }

    // Generate nodes
    const nodeSet = new Set();
    parsedEdges.forEach(edge => {
      nodeSet.add(edge.source);
      nodeSet.add(edge.target);
    });

    // Add remaining nodes if vertices > nodeSet.size
    for (let i = 0; nodeSet.size < vertices; i++) {
      nodeSet.add(`${i}`);
    }

    const nodes = Array.from(nodeSet).map(id => ({ id }));
    
    onGenerateGraph({ nodes, links: parsedEdges });
    toast.success('Graph generated successfully!');
  };

  const handleClear = () => {
    setGraphInput('');
    onGenerateGraph({ nodes: [], links: [] });
    toast.info('Canvas cleared');
  };

  return (
    <div 
      data-testid="control-panel"
      className="fixed top-6 left-6 w-96 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      style={{ zIndex: 10, maxHeight: 'calc(100vh - 3rem)' }}
    >
      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Graph Explorer
          </h1>
          <p className="text-xs text-white/50 mt-1 font-mono">Interactive Visualization</p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div data-testid="graph-input-container">
            <Label htmlFor="graphInput" className="text-white/70 text-xs uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-3 h-3" />
              Graph Input
            </Label>
            <Textarea
              id="graphInput"
              data-testid="graph-input-textarea"
              value={graphInput}
              onChange={(e) => setGraphInput(e.target.value)}
              placeholder="5 7&#10;A B 10&#10;B C 5&#10;C D 3&#10;D E 8&#10;E A 2&#10;A C 15&#10;B D 6"
              rows={10}
              className="mt-2 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder:text-white/20 font-mono text-sm resize-none"
            />
            <div className="text-[10px] text-white/40 mt-2 font-mono space-y-1">
              <p>Line 1: VERTICES EDGES</p>
              <p>Next lines: SOURCE TARGET [WEIGHT]</p>
              <p className="text-cyan-400/60">Weight is optional</p>
            </div>
          </div>
        </div>

        {/* Graph Options */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4 backdrop-blur-md space-y-3">
          <div data-testid="graph-type-toggle" className="flex items-center justify-between">
            <div>
              <Label className="text-white/90 font-semibold text-sm">Directed Graph</Label>
              <p className="text-[10px] text-white/50 mt-0.5">Show directional arrows</p>
            </div>
            <Switch
              data-testid="directed-graph-switch"
              checked={isDirected}
              onCheckedChange={setIsDirected}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>

          <div className="h-px bg-white/10"></div>

          <div data-testid="show-weights-toggle" className="flex items-center justify-between">
            <div>
              <Label className="text-white/90 font-semibold text-sm">Show Weights</Label>
              <p className="text-[10px] text-white/50 mt-0.5">Display edge weights</p>
            </div>
            <Switch
              data-testid="show-weights-switch"
              checked={showWeights}
              onCheckedChange={setShowWeights}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            data-testid="generate-graph-button"
            onClick={handleGenerate}
            className="w-full bg-cyan-500 text-black font-bold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all duration-300 rounded-lg uppercase tracking-wider text-xs h-11"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Graph
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              data-testid="export-button"
              onClick={onExport}
              variant="outline"
              className="bg-transparent border border-white/20 text-white hover:border-white/50 hover:bg-white/5 transition-all duration-300 rounded-lg uppercase tracking-wider text-xs"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button
              data-testid="clear-button"
              onClick={handleClear}
              variant="outline"
              className="bg-transparent border border-white/20 text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 rounded-lg uppercase tracking-wider text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
