# AI Agent Instructions: Graph Visual Frontend

## Project Overview
**Graph Visual** is a React-based graph visualization and manipulation tool that allows users to generate, visualize, and interact with network graphs using a force-directed layout. The application supports both directed and undirected graphs with customizable node/link colors, weights, and interactive hover states.

## Architecture & Data Flow

### Component Structure
- **App.js** (root): Central state management for graph data and UI settings
- **GraphCanvas.js**: Force-directed graph rendering using `react-force-graph-2d`
- **ControlPanel.js**: User input, graph generation, export functionality
- **src/ui/**: Radix UI component library (button, input, textarea, switch, label, etc.)

### Critical Data Flow
1. User enters graph data in **ControlPanel** (format: `vertices edges` on line 1, then edge lines `source target [weight]`)
2. ControlPanel validates and parses input → generates `{nodes: [], links: []}`
3. Calls `onGenerateGraph()` callback to update App state
4. App passes `graphData`, styling props, and hover handlers to **GraphCanvas**
5. GraphCanvas renders with `react-force-graph-2d` and handles physics simulation

### State Properties (from App.js)
```javascript
graphData: { nodes: [], links: [] }
isDirected: boolean
showWeights: boolean
nodeColor: string (hex)
linkColor: string (hex)
hoveredNode: node object | null
hoveredLink: link object | null
```

## Key Dependencies & Patterns

### Build & Development
- **CRA with Craco**: Uses `craco.config.js` for webpack customization (alias `@` → `src/`)
- **Build command**: `npm start` (dev) / `npm run build` (production)
- **Tailwind CSS**: Dark-mode enabled, custom CSS variables for theming
- **Path alias**: Use `@/components/...` instead of relative paths

### UI Framework
- **Radix UI components** via `src/ui/` (pre-built, headless)
- **Lucide React icons**: For button iconography (ZoomIn, ZoomOut, Download, etc.)
- **Sonner toasts**: For user feedback (`toast.success`, `toast.error`, `toast.warning`, `toast.info`)

### Graph Rendering
- **react-force-graph-2d**: 2D force-directed graph with physics simulation
- **ForceGraph2D ref pattern**: Use `fgRef.current.zoomToFit()` for auto-zoom on data change
- **Node colors**: Auto-generated from palette in `generateNodeColors()` (15 vibrant colors)
- **Canvas export**: Uses native canvas `toBlob()` API

## Input Format & Validation

Graph input format (ControlPanel):
```
<num_vertices> <num_edges>
<source> <target> [weight]
<source> <target> [weight]
...
```

**Validation rules**:
- Line 1: Must have 2 space-separated integers (vertices, edges)
- Edge lines: Require at least 2 tokens (source, target); optional 3rd token is weight
- Nodes are strings (can be numbers, letters, or alphanumeric IDs)
- Weight is optional but parsed as float if present
- Warns if parsed edges ≠ declared edges count

## Common Workflows

### Adding a Feature
1. Create UI components in `src/ui/` or use existing Radix components
2. Add state to App.js using `useState()`
3. Pass props + callbacks to component
4. Component calls callback with new value
5. Export PNG: Canvas → blob → download link (see App.js `handleExport`)

### Styling
- Use **Tailwind classes** (dark mode default)
- CSS variables: `rgba(0, 240, 255, 0.2)` (cyan accent), black/white text
- ControlPanel: Fixed top-left, dark overlay with backdrop blur, z-index: 10
- Dark theme with cyan (#00F0FF) and white (#FFFFFF) accents

### Error Handling
- Always validate input before state updates
- Use `toast.error()` for user-facing errors; `console.error()` for debugging
- Graceful degradation (e.g., export checks if canvas exists)

## File Organization

```
src/
  App.js              # Root component, state management
  App.css             # Global styles
  components/
    GraphCanvas.js    # Force-directed graph rendering
    ControlPanel.js   # Input, controls, export
    ui/               # 30+ Radix UI components (pre-built)
  hooks/
    use-toast.js      # Sonner toast hook
  lib/
    utils.js          # Utility functions
plugins/
  health-check/       # Webpack health plugin (optional)
  visual-edits/       # Babel metadata plugin (dev-only)
```

## Performance Considerations
- **Graph rendering**: Force-directed physics settles with `setTimeout()` before zoom-to-fit
- **Component memoization**: Use `useCallback` for handlers (implemented in App.js)
- **Canvas export**: Non-blocking blob creation with URL revocation
- **Color generation**: Pre-computed palette, cyclic assignment by index

## Important Notes
- **React 19** compatibility ensured (date-fns 3.x, react-day-picker 9.4.0)
- **No backend integration**: All graph logic is client-side
- **Canvas-only visualization**: No SVG, relies on HTML5 Canvas API
- **Accessibility**: Radix UI provides a11y defaults; add ARIA labels to new interactive elements

---

**Last Updated**: January 2026  
**Framework**: React 19 + Craco + Tailwind + Radix UI
