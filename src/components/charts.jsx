// Lightweight, dependency-free SVG charts tuned to the dashboard theme.

export function DonutChart({ segments, size = 160, thickness = 22, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  let offset = 0;

  return (
    <div className="donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--track)"
          strokeWidth={thickness}
        />
        {total > 0 &&
          segments.map((s, i) => {
            const frac = s.value / total;
            const len = frac * c;
            const el = (
              <circle
                key={i}
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cx})`}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="donut-center">
        <strong>{centerLabel}</strong>
        {centerSub && <span>{centerSub}</span>}
      </div>
    </div>
  );
}

// Grouped bars: each item has {label, created, completed}.
export function GroupedBars({ data, height = 220 }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.created, d.completed)));
  const pad = { top: 16, bottom: 28, left: 28 };
  const innerH = height - pad.top - pad.bottom;
  const groupW = 100 / data.length;
  const ticks = niceTicks(max, 4);

  return (
    <svg className="bars" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      {ticks.map((t, i) => {
        const y = pad.top + innerH - (t / max) * innerH;
        return (
          <line
            key={i}
            x1="0"
            x2="100"
            y1={y}
            y2={y}
            stroke="var(--border)"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {data.map((d, i) => {
        const gx = i * groupW;
        const bw = groupW * 0.28;
        const gap = groupW * 0.12;
        const cx = gx + groupW / 2;
        const hc = (d.completed / max) * innerH;
        const hn = (d.created / max) * innerH;
        return (
          <g key={i}>
            <rect
              x={cx - bw - gap / 2}
              y={pad.top + innerH - hn}
              width={bw}
              height={hn}
              rx="1"
              fill="var(--c-created)"
            />
            <rect
              x={cx + gap / 2}
              y={pad.top + innerH - hc}
              width={bw}
              height={hc}
              rx="1"
              fill="var(--c-done)"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function BarLabels({ data }) {
  return (
    <div className="bar-labels">
      {data.map((d, i) => (
        <span key={i}>{d.label}</span>
      ))}
    </div>
  );
}

// Horizontal bars for project distribution.
export function HBars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="hbars">
      {data.map((d) => (
        <div className="hbar-row" key={d.name}>
          <div className="hbar-head">
            <span className="dot" style={{ background: d.color }} />
            <span className="hbar-name">{d.name}</span>
            <span className="hbar-val">{d.value}</span>
          </div>
          <div className="hbar-track">
            <div
              className="hbar-fill"
              style={{ width: (d.value / max) * 100 + "%", background: d.color }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="muted">No tasks yet</p>}
    </div>
  );
}

export function HeatMap({ grid }) {
  const { cols, max } = grid;
  const cell = 13;
  const gap = 3;
  const w = cols.length * (cell + gap);
  const h = 7 * (cell + gap);
  function shade(count, future) {
    if (future) return "transparent";
    if (count === 0) return "var(--track)";
    const t = count / max;
    const alpha = 0.25 + 0.75 * t;
    return `rgba(99, 102, 241, ${alpha.toFixed(2)})`;
  }
  return (
    <svg className="heatmap" viewBox={`0 0 ${w} ${h}`} width="100%">
      {cols.map((col, ci) =>
        col.map((d, di) => (
          <rect
            key={d.key}
            x={ci * (cell + gap)}
            y={di * (cell + gap)}
            width={cell}
            height={cell}
            rx="3"
            fill={shade(d.count, d.future)}
          >
            <title>{`${d.key}: ${d.count} completed`}</title>
          </rect>
        ))
      )}
    </svg>
  );
}

function niceTicks(max, n) {
  const step = Math.max(1, Math.ceil(max / n));
  const out = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  return out;
}

export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map((it) => (
        <span className="legend-item" key={it.label}>
          <span className="legend-dot" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
