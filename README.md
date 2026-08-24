# Graph Explorer

An interactive graph visualization tool built with React and [react-force-graph-2d](https://github.com/vasturiano/react-force-graph). Render directed/undirected weighted graphs with a force-directed layout, drag nodes, zoom, pan, and export snapshots as PNG.

## Features

- **Force-directed layout** with configurable physics (charge, link distance, decay)
- **Directed & undirected** graphs toggle with directional arrows
- **Weighted edges** with optional weight display
- **Interactive** - drag nodes, zoom, pan, hover highlighting
- **Edge highlighting on hover** - outgoing edges (green) and incoming edges (purple) are color-coded when hovering a node
- **Export to PNG** - download the current canvas as an image
- **Dark theme UI** with a glassmorphism control panel

## Input Format

```
<num_vertices> <num_edges>
<source> <target> [weight]
<source> <target> [weight]
...
```

**Example:**

```
5 7
A B 10
B C 5
C D 3
D E 8
E A 2
A C 15
B D 6
```

- First line: number of vertices and edges
- Subsequent lines: edge definitions (source, target, optional weight)
- Node labels can be any string (numeric or alphabetic)

## Tech Stack

- **React 19** with Create React App + CRACO
- **react-force-graph-2d** for canvas-based graph rendering
- **Tailwind CSS 3** for styling
- **Radix UI** primitives (via shadcn/ui components)
- **Lucide React** for icons
- **Sonner** for toast notifications

## Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn

### Installation

```bash
yarn install
```

### Development

```bash
yarn start
```

Opens [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
yarn build
```

## Project Structure

```
src/
  App.js                  # Main app with state management and export logic
  components/
    GraphCanvas.js        # Force-graph canvas with custom node/edge rendering
    ControlPanel.js       # Input panel, options, and action buttons
    ui/                   # shadcn/ui component library
  hooks/
    use-toast.js          # Toast hook
  lib/
    utils.js              # Utility functions (cn)
plugins/
  health-check/          # Optional webpack health check plugin
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `WDS_SOCKET_PORT` | `443` | WebSocket port for dev server |
| `ENABLE_HEALTH_CHECK` | `false` | Enable webpack health check endpoints |

## License

MIT
