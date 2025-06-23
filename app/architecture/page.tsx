
"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Database,
  Search,
  MessageSquare,
  Shield,
  BarChart3,
  Zap,
  MemoryStickIcon as Memory,
  Bot,
  Lock,
  TrendingUp,
  Layers,
  Network,
  Eye,
  Cpu,
  Server,
} from "lucide-react"

interface ArchitectureNode {
  id: string
  title: string
  description: string
  category: "core" | "agents" | "storage" | "api" | "ui" | "integration" | "security"
  icon: React.ReactNode
  x: number
  y: number
  connections: string[]
  details: string[]
  color: string
}

interface Connection {
  from: string
  to: string
  label?: string
}

const architectureNodes: ArchitectureNode[] = [
  // Core Infrastructure
  {
    id: "keywords-ai",
    title: "Keywords AI Gateway",
    description: "Primary LLM provider with 250+ models",
    category: "core",
    icon: <Brain className="w-6 h-6" />,
    x: 0,
    y: 0,
    connections: ["general-agent", "habit-coach", "analytics"],
    details: ["Load balancing & retries", "GPT-4o, Claude, Gemini, Llama", "Real-time analytics", "Cost tracking"],
    color: "bg-blue-500",
  },
  {
    id: "mem0",
    title: "Mem0 Memory System",
    description: "Persistent conversation memory",
    category: "core",
    icon: <Memory className="w-6 h-6" />,
    x: 300,
    y: -100,
    connections: ["supabase", "general-agent"],
    details: ["OpenAI embeddings", "1536-dimension vectors", "Context retrieval", "User preferences"],
    color: "bg-purple-500",
  },
  {
    id: "tavily",
    title: "Tavily Search",
    description: "Real-time web search",
    category: "core",
    icon: <Search className="w-6 h-6" />,
    x: -300,
    y: -100,
    connections: ["general-agent", "habit-coach"],
    details: ["Web & news search", "AI-generated summaries", "Source attribution", "Recency filtering"],
    color: "bg-green-500",
  },

  // AI Agents
  {
    id: "general-agent",
    title: "General Agent",
    description: "Primary wellness assistant",
    category: "agents",
    icon: <Bot className="w-6 h-6" />,
    x: 0,
    y: 200,
    connections: ["indexeddb", "chat-api", "habit-coach"],
    details: ["Habit tracking", "Points management", "Memory operations", "Web search integration"],
    color: "bg-orange-500",
  },
  {
    id: "habit-coach",
    title: "Habit Coach Agent",
    description: "Evidence-based coaching",
    category: "agents",
    icon: <TrendingUp className="w-6 h-6" />,
    x: 300,
    y: 200,
    connections: ["general-agent", "tavily"],
    details: ["Personalized strategies", "Scientific research", "Progress tracking", "Memory-based continuity"],
    color: "bg-indigo-500",
  },

  // Storage Layer
  {
    id: "supabase",
    title: "Supabase Database",
    description: "Primary PostgreSQL database",
    category: "storage",
    icon: <Database className="w-6 h-6" />,
    x: 600,
    y: 0,
    connections: ["mem0", "auth-api"],
    details: ["User profiles", "Memory history", "Row Level Security", "Real-time subscriptions"],
    color: "bg-emerald-500",
  },
  {
    id: "indexeddb",
    title: "IndexedDB",
    description: "Local browser storage",
    category: "storage",
    icon: <Server className="w-6 h-6" />,
    x: 0,
    y: 400,
    connections: ["general-agent", "ui-layer"],
    details: ["Offline capability", "Habits & completions", "Rewards & redemptions", "Real-time sync"],
    color: "bg-cyan-500",
  },

  // API Layer
  {
    id: "chat-api",
    title: "Chat API",
    description: "/api/chat/completions",
    category: "api",
    icon: <MessageSquare className="w-6 h-6" />,
    x: -300,
    y: 200,
    connections: ["keywords-ai", "general-agent"],
    details: ["Function calling support", "User tracking", "Memory integration", "Analytics tracking"],
    color: "bg-red-500",
  },
  {
    id: "auth-api",
    title: "Auth API",
    description: "Authentication endpoints",
    category: "api",
    icon: <Shield className="w-6 h-6" />,
    x: 600,
    y: 200,
    connections: ["supabase", "ui-layer"],
    details: ["Supabase Auth", "JWT tokens", "Session management", "CSRF protection"],
    color: "bg-yellow-500",
  },

  // UI Layer
  {
    id: "ui-layer",
    title: "React UI Layer",
    description: "Next.js frontend",
    category: "ui",
    icon: <Layers className="w-6 h-6" />,
    x: 300,
    y: 400,
    connections: ["indexeddb", "auth-api", "realtime"],
    details: ["Mobile-first responsive", "Context providers", "Real-time updates", "Voice streaming"],
    color: "bg-pink-500",
  },
  {
    id: "realtime",
    title: "Real-time Features",
    description: "WebRTC & live updates",
    category: "ui",
    icon: <Zap className="w-6 h-6" />,
    x: 600,
    y: 400,
    connections: ["ui-layer"],
    details: ["Voice streaming", "Live habit updates", "Real-time analytics", "WebRTC connection"],
    color: "bg-violet-500",
  },

  // Analytics & Security
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "Keywords AI monitoring",
    category: "integration",
    icon: <BarChart3 className="w-6 h-6" />,
    x: -600,
    y: 0,
    connections: ["keywords-ai"],
    details: ["Request patterns", "Token usage & costs", "User behavior", "Performance metrics"],
    color: "bg-teal-500",
  },
  {
    id: "security",
    title: "Security Layer",
    description: "Multi-layer protection",
    category: "security",
    icon: <Lock className="w-6 h-6" />,
    x: -600,
    y: 200,
    connections: ["auth-api"],
    details: ["Encryption in-transit", "Row Level Security", "Rate limiting", "Input validation"],
    color: "bg-slate-500",
  },
]

const connections: Connection[] = [
  { from: "keywords-ai", to: "general-agent", label: "LLM Requests" },
  { from: "keywords-ai", to: "habit-coach", label: "AI Processing" },
  { from: "mem0", to: "supabase", label: "Memory Storage" },
  { from: "tavily", to: "general-agent", label: "Search Results" },
  { from: "general-agent", to: "indexeddb", label: "Data Updates" },
  { from: "chat-api", to: "keywords-ai", label: "Proxy Requests" },
  { from: "supabase", to: "auth-api", label: "User Data" },
  { from: "ui-layer", to: "indexeddb", label: "Local Storage" },
  { from: "keywords-ai", to: "analytics", label: "Metrics" },
]

export default function ArchitectureCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 })
  const [nodes, setNodes] = useState<ArchitectureNode[]>(architectureNodes)

  // Calculate dynamic SVG bounds
  const svgBounds = useMemo(() => {
    const padding = 500
    const cardWidth = 320
    const cardHeight = 150

    const minX = Math.min(...nodes.map((n) => n.x)) - padding
    const maxX = Math.max(...nodes.map((n) => n.x)) + cardWidth + padding
    const minY = Math.min(...nodes.map((n) => n.y)) - padding
    const maxY = Math.max(...nodes.map((n) => n.y)) + cardHeight + padding

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }, [nodes])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setIsDragging(true)
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
      }
    },
    [transform],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggedNode) {
        const deltaX = (e.clientX - nodeDragStart.x) / transform.scale
        const deltaY = (e.clientY - nodeDragStart.y) / transform.scale

        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === draggedNode
              ? { ...node, x: nodeDragStart.nodeX + deltaX, y: nodeDragStart.nodeY + deltaY }
              : node,
          ),
        )
      } else if (isDragging) {
        setTransform((prev) => ({
          ...prev,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        }))
      }
    },
    [draggedNode, nodeDragStart, transform.scale, isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale * delta)),
    }))
  }, [])

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation()
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      setDraggedNode(nodeId)
      setNodeDragStart({
        x: e.clientX,
        y: e.clientY,
        nodeX: node.x,
        nodeY: node.y,
      })
    },
    [nodes],
  )

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
    setSelectedNode(null)
  }

  const resetLayout = () => {
    setNodes(architectureNodes)
    setTransform({ x: 0, y: 0, scale: 1 })
    setSelectedNode(null)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      core: "border-blue-200 bg-blue-50",
      agents: "border-orange-200 bg-orange-50",
      storage: "border-green-200 bg-green-50",
      api: "border-red-200 bg-red-50",
      ui: "border-purple-200 bg-purple-50",
      integration: "border-teal-200 bg-teal-50",
      security: "border-slate-200 bg-slate-50",
    }
    return colors[category as keyof typeof colors] || "border-gray-200 bg-gray-50"
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Minimalistic Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 px-4 py-2">
          <h1 className="text-lg font-semibold text-slate-900">Wei AI Architecture</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={resetView}
            variant="ghost"
            size="sm"
            className="bg-white/80 backdrop-blur-sm border border-slate-200/50 text-primary-foreground"
          >
            Reset View
          </Button>
          <Button
            onClick={resetLayout}
            variant="ghost"
            size="sm"
            className="bg-white/80 backdrop-blur-sm border border-slate-200/50 text-primary-foreground"
          >
            Reset Layout
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Dynamic SVG for Connection Lines */}
          <svg
            className="absolute pointer-events-none"
            style={{
              left: svgBounds.x,
              top: svgBounds.y,
              width: svgBounds.width,
              height: svgBounds.height,
              zIndex: 1,
            }}
          >
            {connections.map((conn, index) => {
              const fromNode = nodes.find((n) => n.id === conn.from)
              const toNode = nodes.find((n) => n.id === conn.to)
              if (!fromNode || !toNode) return null

              const fromX = fromNode.x - svgBounds.x + 160 // Half card width
              const fromY = fromNode.y - svgBounds.y + 75 // Half card height
              const toX = toNode.x - svgBounds.x + 160
              const toY = toNode.y - svgBounds.y + 75

              return (
                <g key={index}>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  {conn.label && (
                    <text
                      x={(fromX + toX) / 2}
                      y={(fromY + toY) / 2}
                      fill="#64748b"
                      fontSize="12"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Architecture Nodes */}
          <div className="relative" style={{ zIndex: 2 }}>
            {nodes.map((node) => (
              <Card
                key={node.id}
                className={`absolute w-80 cursor-move transition-all duration-200 hover:shadow-lg hover:scale-105 ${getCategoryColor(node.category)} ${
                  selectedNode?.id === node.id ? "ring-2 ring-blue-500 shadow-xl scale-105" : ""
                } ${draggedNode === node.id ? "shadow-2xl scale-110 z-50" : ""}`}
                style={{
                  left: node.x,
                  top: node.y,
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={(e) => {
                  if (!draggedNode) {
                    setSelectedNode(selectedNode?.id === node.id ? null : node)
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-white ${node.color}`}>{node.icon}</div>
                    <div>
                      <CardTitle className="text-lg text-primary-foreground">{node.title}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs text-primary-foreground">
                        {node.category.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">{node.description}</p>
                  {selectedNode?.id === node.id && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Features:</h4>
                      <ul className="space-y-1">
                        {node.details.map((detail, index) => (
                          <li key={index} className="text-xs text-slate-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 p-4 max-w-sm">
        <h3 className="font-semibold mb-3 text-slate-900">Architecture Layers</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { category: "core", label: "Core Infrastructure", color: "bg-blue-500" },
            { category: "agents", label: "AI Agents", color: "bg-orange-500" },
            { category: "storage", label: "Data Storage", color: "bg-green-500" },
            { category: "api", label: "API Layer", color: "bg-red-500" },
            { category: "ui", label: "User Interface", color: "bg-purple-500" },
            { category: "integration", label: "Integrations", color: "bg-teal-500" },
            { category: "security", label: "Security", color: "bg-slate-500" },
          ].map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${item.color}`} />
              <span className="text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 p-4">
        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            <span>{nodes.length} Components</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{connections.length} Connections</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>Scale: {Math.round(transform.scale * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
