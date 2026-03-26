import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import type { BACPoint } from '../../lib/bac-engine'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface BACGraphProps {
  points: BACPoint[]
}

export default function BACGraph({ points }: BACGraphProps) {
  const chartData = useMemo(() => {
    if (points.length === 0) {
      return {
        labels: [] as string[],
        datasets: [{
          data: [] as number[],
          borderColor: '#7c5cfc',
          backgroundColor: 'rgba(124, 92, 252, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        }],
      }
    }

    // Sample points to reduce chart size (max ~120 points)
    const maxPoints = 120
    const step = Math.max(1, Math.floor(points.length / maxPoints))
    const sampled = points.filter((_, i) => i % step === 0)

    const labels = sampled.map((p) => {
      const d = new Date(p.time)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    const data = sampled.map((p) => Math.round(p.bac * 1000) / 1000)

    // Create gradient color based on BAC values
    const borderColor = data.map((bac) => {
      if (bac <= 0.04) return '#4ade80'
      if (bac <= 0.08) return '#facc15'
      return '#f87171'
    })

    return {
      labels,
      datasets: [
        {
          data,
          borderColor: borderColor.length > 0 ? '#7c5cfc' : '#7c5cfc',
          backgroundColor: 'rgba(124, 92, 252, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
          segment: {
            borderColor: (ctx: { p1DataIndex: number }) => {
              const bac = data[ctx.p1DataIndex]
              if (bac > 0.08) return '#f87171'
              if (bac > 0.04) return '#facc15'
              return '#4ade80'
            },
          },
        },
      ],
    }
  }, [points])

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `BAC: ${(ctx.raw as number).toFixed(3)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#a09bb5',
          maxTicksLimit: 6,
          font: { size: 10 },
        },
        grid: { color: 'rgba(160, 155, 181, 0.1)' },
      },
      y: {
        min: 0,
        ticks: {
          color: '#a09bb5',
          font: { size: 10 },
          callback: (value) => (value as number).toFixed(2),
        },
        grid: { color: 'rgba(160, 155, 181, 0.1)' },
      },
    },
  }

  if (points.length === 0) {
    return (
      <div className="bg-[var(--color-bg-card)] rounded-xl p-4">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">BAC Over Time</p>
        <div className="h-48 flex items-center justify-center text-[var(--color-text-secondary)] text-sm">
          Add drinks to see your BAC graph
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl p-4">
      <p className="text-sm text-[var(--color-text-secondary)] mb-2">BAC Over Time</p>
      <div className="h-48">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
