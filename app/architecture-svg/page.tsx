"use client"

import Image from "next/image"
import { useState, useRef } from "react"

export default function ArchitectureSvg() {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY
    const scaleChange = delta > 0 ? 0.9 : 1.1 // Zoom out/in by 10%
    setScale(prevScale => {
      const newScale = prevScale * scaleChange
      // Limit zoom between 0.5x and 3x
      return Math.min(Math.max(newScale, 0.5), 3)
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    setPosition({
      x: newX,
      y: newY
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative w-[90%] h-[90%] mx-auto"
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          transformOrigin: '50% 50%'
        }}
      >
        <Image
          src="/wei-agent-architecture.svg"
          alt="Wei Agent Architecture Diagram"
          fill
          style={{ objectFit: "contain" }}
          priority
          draggable={false}
        />
      </div>
    </div>
  )
}
