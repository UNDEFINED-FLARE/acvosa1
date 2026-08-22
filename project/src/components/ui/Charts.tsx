interface LineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  className?: string;
  area?: boolean;
}

export function LineChart({ data, labels, height = 180, className = '', area = true }: LineChartProps) {
  const width = 600;
  const pad = { top: 16, right: 16, bottom: 28, left: 36 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = w / Math.max(1, data.length - 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + h - ((d - min) / range) * h,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${pad.top + h} L ${pad.left} ${pad.top + h} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => pad.top + h - t * h);
  const monthLabels = labels ?? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${className}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111111" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#111111" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((y, i) => (
        <line key={i} x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#F1F1F1" strokeWidth="1" />
      ))}
      {area && <path d={areaD} fill="url(#lineArea)" />}
      <path d={pathD} fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#111111" />
      ))}
      {monthLabels.slice(0, data.length).map((l, i) => (
        <text
          key={i}
          x={pad.left + i * stepX}
          y={height - 8}
          textAnchor="middle"
          fontSize="9"
          fill="#333333"
          opacity="0.5"
          fontFamily="Inter, sans-serif"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

interface BarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  className?: string;
}

export function BarChart({ data, labels, height = 180, className = '' }: BarChartProps) {
  const width = 600;
  const pad = { top: 16, right: 16, bottom: 28, left: 36 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(...data, 1);
  const barW = (w / data.length) * 0.55;
  const gap = (w / data.length) * 0.45;
  const monthLabels = labels ?? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${className}`} preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={pad.left}
          y1={pad.top + h - t * h}
          x2={width - pad.right}
          y2={pad.top + h - t * h}
          stroke="#F1F1F1"
          strokeWidth="1"
        />
      ))}
      {data.map((d, i) => {
        const barH = (d / max) * h;
        const x = pad.left + i * (barW + gap) + gap / 2;
        const y = pad.top + h - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill="#1F1F1F" className="transition-all duration-500" />
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#333333"
              opacity="0.5"
              fontFamily="Inter, sans-serif"
            >
              {monthLabels[i] ?? ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface DonutProps {
  segments: { label: string; value: number }[];
  size?: number;
  className?: string;
}

export function DonutChart({ segments, size = 180, className = '' }: DonutProps) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const radius = size / 2 - 12;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const shades = ['#111111', '#333333', '#666666', '#999999', '#BFBFBF'];

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F1F1" strokeWidth="14" />
        {segments.map((s, i) => {
          const len = (s.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={shades[i % shades.length]}
              strokeWidth="14"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
              className="transition-all duration-700"
            />
          );
          offset += len;
          return el;
        })}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#111111"
          fontFamily="Inter, sans-serif"
        >
          {total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          fontSize="9"
          fill="#333333"
          opacity="0.6"
          fontFamily="Inter, sans-serif"
        >
          Total
        </text>
      </svg>
      <div className="flex flex-col gap-2.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: shades[i % shades.length] }} />
            <span className="text-xs text-ink-dark-grey tracking-tight">{s.label}</span>
            <span className="text-xs font-semibold text-ink-charcoal tabular-nums ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HBarProps {
  label: string;
  value: number;
  max: number;
  display: string;
}

export function HBarList({ items, className = '' }: { items: HBarProps[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((it, i) => {
        const pct = Math.min(100, (it.value / it.max) * 100);
        return (
          <div key={i}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm text-ink-dark-grey tracking-tight">{it.label}</span>
              <span className="text-sm font-semibold text-ink-charcoal tabular-nums">{it.display}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink-light-grey overflow-hidden">
              <div className="h-full rounded-full bg-ink-charcoal transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
