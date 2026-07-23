import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D, {type ForceGraphMethods } from 'react-force-graph-2d';
import { Network, Activity, User, FileText, AlertTriangle, X, Search, ShieldAlert } from 'lucide-react';
import { networkService, type GraphData, type Node } from '../../services/network';

export const NetworkIntelligence: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive States
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fgRef = useRef<ForceGraphMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      setIsLoading(true);
      try {
        const data = await networkService.getLinkAnalysis();
        setGraphData(data);
      } catch (error) {
        console.error("Failed to load network graph", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraph();
  }, []);

  // Calculate global stats for the default overview panel
  const globalStats = useMemo(() => {
    const suspects = graphData.nodes.filter(n => n.group === 'person');
    const highThreat = suspects.filter(n => n.val > 7);
    return {
      totalSuspects: suspects.length,
      totalCases: graphData.nodes.length - suspects.length,
      highThreatCount: highThreat.length,
      topSuspect: suspects.sort((a, b) => b.val - a.val)[0]
    };
  }, [graphData]);

  // Search filtering
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lower = searchTerm.toLowerCase();
    return graphData.nodes.filter(n => n.name.toLowerCase().includes(lower)).slice(0, 5);
  }, [searchTerm, graphData]);

  const connectedNeighbors = useMemo(() => {
    if (!selectedNode) return [];
    return graphData.links
      .filter(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
        return sourceId === selectedNode.id || targetId === selectedNode.id;
      })
      .map(link => {
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const neighborId = sourceId === selectedNode.id ? targetId : sourceId;
        return graphData.nodes.find(n => n.id === neighborId);
      })
      .filter(Boolean) as Node[];
  }, [selectedNode, graphData]);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setSearchTerm('');
    setShowSearchResults(false);
    
    const newHighlightNodes = new Set<string>();
    const newHighlightLinks = new Set<string>();
    
    newHighlightNodes.add(node.id);
    
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      
      if (sourceId === node.id || targetId === node.id) {
        newHighlightLinks.add(`${sourceId}-${targetId}`);
        newHighlightNodes.add(sourceId);
        newHighlightNodes.add(targetId);
      }
    });

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);

    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(3, 1000);
    }
  };

  const clearSelection = () => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    if (fgRef.current) fgRef.current.zoomToFit(1000, 50);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Search */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="h-6 w-6 text-purple-500" />
            Network Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Map and analyze criminal syndicates, repeat offenders, and connected cases.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-80 z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search suspect or FIR..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              {searchResults.map(result => (
                <div 
                  key={result.id}
                  onClick={() => handleNodeClick(result)}
                  className="p-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3 border-b border-slate-800/50 last:border-0"
                >
                  {result.group === 'person' ? <User className="h-4 w-4 text-red-400" /> : <FileText className="h-4 w-4 text-blue-400" />}
                  <span className="text-sm text-slate-200">{result.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 relative">
        {/* Graph Container */}
        <div 
          ref={containerRef} 
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <Activity className="h-8 w-8 text-purple-500 animate-bounce" />
              <span className="text-slate-400 text-sm animate-pulse">Mapping Underworld Connections...</span>
            </div>
          ) : (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const isDimmed = highlightNodes.size > 0 && !highlightNodes.has(node.id);
                const isSelected = highlightNodes.has(node.id) && selectedNode?.id === node.id;
                
                let nodeColor;
                if (node.group === 'case') {
                  nodeColor = '#3b82f6'; 
                } else {
                  if (node.val <= 7) nodeColor = '#f59e0b'; 
                  else if (node.val <= 9) nodeColor = '#f97316'; 
                  else if (node.val <= 11) nodeColor = '#ef4444'; 
                  else nodeColor = '#9f1239'; 
                }

                if (isDimmed) nodeColor = '#1e293b'; 
                if (isSelected) nodeColor = '#fbbf24'; 

                ctx.beginPath();
                
                // UX UPGRADE: Different Geometry for Cases vs People
                if (node.group === 'case') {
                  const size = 6;
                  ctx.rect(node.x - size/2, node.y - size/2, size, size); // Draw Square
                } else {
                  const radius = Math.min(node.val / 1.5, 8);
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false); // Draw Circle
                }
                
                ctx.fillStyle = nodeColor;
                ctx.fill();

                if (!isDimmed && node.group === 'person') {
                  const label = node.name;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';
                  ctx.fillStyle = isSelected ? '#fbbf24' : '#e2e8f0'; 
                  ctx.fillText(label, node.x, node.y + 6 + 2); 
                }
              }}
              linkColor={(link: any) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                if (highlightLinks.size > 0 && highlightLinks.has(`${sourceId}-${targetId}`)) return '#fbbf24'; 
                return highlightNodes.size > 0 ? '#0f172a' : '#334155'; 
              }}
              linkWidth={(link: any) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return highlightLinks.has(`${sourceId}-${targetId}`) ? 3 : 1;
              }}
              backgroundColor="#0f172a" 
              onNodeClick={handleNodeClick}
              onBackgroundClick={clearSelection}
              onEngineStop={() => {
                if (fgRef.current && !selectedNode) fgRef.current.zoomToFit(400, 70); 
              }}
            />
          )}
        </div>

        {/* Dynamic Context Panel */}
        <div className="w-96 bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-xl">
          {!selectedNode ? (
            // DEFAULT OVERVIEW (When nothing is clicked)
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <ShieldAlert className="h-5 w-5 text-purple-500" />
                Macro Overview
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-2xl font-bold text-red-400 block">{globalStats.totalSuspects}</span>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Habitual Suspects</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-2xl font-bold text-blue-400 block">{globalStats.totalCases}</span>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Linked Cases</span>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Priority Targets
                </h3>
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{globalStats.highThreatCount} individuals</strong> have been identified as high-threat, meaning they are connected to 4 or more active FIRs in the current dataset.
                </p>
              </div>
              
              {globalStats.topSuspect && (
                <div className="mt-auto">
                  <span className="text-xs text-slate-500 uppercase font-semibold block mb-2">Most Active Suspect</span>
                  <button 
                    onClick={() => handleNodeClick(globalStats.topSuspect)}
                    className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg border border-slate-700 flex justify-between items-center"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-red-400" /> {globalStats.topSuspect.name}
                    </span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">View Profile</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // SPECIFIC NODE DOSSIER (When a node is clicked)
            <>
              <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-950/50 rounded-t-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 block">
                    {selectedNode.group === 'person' ? 'Suspect Profile' : 'Case Profile'}
                  </span>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedNode.group === 'person' ? <User className="h-5 w-5 text-red-500" /> : <FileText className="h-5 w-5 text-blue-500" />}
                    {selectedNode.name}
                  </h2>
                </div>
                <button onClick={clearSelection} className="text-slate-400 hover:text-white p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
                  {selectedNode.group === 'person' ? (
                    <p className="text-sm text-slate-300">
                      This individual has been identified in multiple investigations. They are directly linked to {connectedNeighbors.length} separate FIRs in the system.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-300">
                        This FIR involves known repeat offenders. There are {connectedNeighbors.length} linked habitual suspects attached to this case.
                      </p>
                      
                      {/* New Details Grid for FIRs */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Case Category</span>
                          <span className="text-sm text-slate-200">{selectedNode.category || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Registration Date</span>
                          <span className="text-sm text-slate-200">
                            {selectedNode.date ? new Date(selectedNode.date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Direct Connections
                </h3>
                
                <ul className="space-y-2">
                  {connectedNeighbors.map(neighbor => (
                    <li 
                      key={neighbor.id} 
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-600 cursor-pointer transition-colors"
                      onClick={() => handleNodeClick(neighbor)}
                    >
                      <div className="flex items-center gap-3">
                        {neighbor.group === 'person' 
                          ? <User className="h-4 w-4 text-red-400" /> 
                          : <FileText className="h-4 w-4 text-blue-400" />
                        }
                        <span className="text-sm font-medium text-slate-200">{neighbor.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};