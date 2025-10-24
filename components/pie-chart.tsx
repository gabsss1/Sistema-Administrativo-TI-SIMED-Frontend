"use client"

import React, { useMemo, useState } from "react"

type Slice = {
  nombre: string
  cantidad: number
  porcentaje: number // Include porcentaje in the Slice type
  id?: number
}

type Props = {
  data: Slice[]
  size?: number
  colors?: string[]
  onSliceClick?: (slice: Slice) => void
  onCenterClick?: () => void
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

  const d = [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")

  return d
}

export function PieChart({ data, size = 200, colors: colorsProp, onSliceClick, onCenterClick }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null)

  const total = useMemo(() => data.reduce((s, it) => s + (it.cantidad || 0), 0), [data])

  const slices = useMemo(() => {
    let angle = 0
    return data.map((d) => {
      const portion = (d.porcentaje / 100) * 360 // Use backend-provided percentage
      const start = angle
      const end = angle + portion
      angle = end
      return {
        ...d,
        start,
        end,
      }
    })
  }, [data])

  const defaultColors = [
    "#6366F1",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
    "#8B5CF6",
    "#F97316",
    "#94A3B8",
    "#FB7185",
    "#60A5FA",
  ]
  const colors = colorsProp && colorsProp.length > 0 ? colorsProp : defaultColors

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>
        {slices.map((s, i) => {
          const d = describeArc(cx, cy, r, s.start, s.end)
          const isHovered = hovered === i
          const mid = (s.start + s.end) / 2
          const midRad = ((mid - 90) * Math.PI) / 180
          const offset = isHovered ? Math.min(14, Math.max(8, r * 0.06)) : 0
          const translateX = Math.cos(midRad) * offset
          const translateY = Math.sin(midRad) * offset

          return (
            <g
              key={i}
              transform={`translate(${translateX} ${translateY})`}
              style={{ transition: "transform 220ms cubic-bezier(.2,.9,.2,1)" }}
            >
              <path
                d={d}
                fill={colors[i % colors.length]}
                stroke="#fff"
                strokeWidth={1}
                pointerEvents="all"
                onMouseEnter={(e) => {
                  setHovered(i)
                  setTooltip({ x: e.clientX + 8, y: e.clientY + 8, label: `${s.nombre}: ${s.cantidad} (${s.porcentaje.toFixed(2)}%)` })
                }}
                onMouseMove={(e) => {
                  setTooltip({ x: e.clientX + 8, y: e.clientY + 8, label: `${s.nombre}: ${s.cantidad} (${s.porcentaje.toFixed(2)}%)` })
                }}
                onMouseLeave={() => {
                  setHovered(null)
                  setTooltip(null)
                }}
                onClick={() => {
                  if (typeof onSliceClick === 'function') onSliceClick(s)
                }}
                filter={isHovered ? "url(#shadow)" : undefined}
              />
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={r * 0.45} fill="#fff" onClick={() => { if (typeof onCenterClick === 'function') onCenterClick() }} style={{ cursor: onCenterClick ? 'pointer' : 'default' }} />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm"
          style={{ fontSize: 12, fill: '#111', pointerEvents: onCenterClick ? 'auto' : 'none', cursor: onCenterClick ? 'pointer' : 'default' }}
          onClick={() => { if (typeof onCenterClick === 'function') onCenterClick() }}
        >
          {total}
        </text>
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none z-50 rounded-md bg-gray-900 text-white text-xs px-2 py-1"
          style={{ position: 'fixed', left: tooltip.x, top: tooltip.y, transform: 'translate(8px, -40%)' }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  )
}

export default PieChart
