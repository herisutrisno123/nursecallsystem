

interface BarChartProps {
  data: { label: string; value: number; value2?: number }[];
  color?: string;
  color2?: string;
  label1?: string;
  label2?: string;
  height?: number;
}

export function BarChart({ data, color = '#3b82f6', color2 = '#ef4444', label1 = 'Value', label2 = 'Value 2', height = 240 }: BarChartProps) {
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0))) * 1.2;
  const barWidth = 100 / data.length;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${data.length * 60 + 40} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - 30 - (height - 50) * ratio;
          return (
            <g key={i}>
              <line x1="35" y1={y} x2={data.length * 60 + 35} y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x="30" y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="8">
                {Math.round(maxVal * ratio)}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const barH1 = ((d.value / maxVal) * (height - 50));
          const barH2 = d.value2 !== undefined ? ((d.value2 / maxVal) * (height - 50)) : 0;
          const x = i * 60 + 45;
          const baseY = height - 30;
          return (
            <g key={i}>
              <rect
                x={x}
                y={baseY - barH1}
                width={barH2 > 0 ? 18 : 30}
                height={barH1}
                fill={color}
                rx="3"
                opacity="0.85"
              />
              {barH2 > 0 && (
                <rect
                  x={x + 20}
                  y={baseY - barH2}
                  width={18}
                  height={barH2}
                  fill={color2}
                  rx="3"
                  opacity="0.85"
                />
              )}
              <text x={x + 15} y={height - 12} textAnchor="middle" fill="#6b7280" fontSize="8">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: color }}></span>
          {label1}
        </span>
        {data[0]?.value2 !== undefined && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: color2 }}></span>
            {label2}
          </span>
        )}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number; value2?: number }[];
  color?: string;
  color2?: string;
  label1?: string;
  label2?: string;
  height?: number;
  dashed?: boolean;
}

export function LineChart({ data, color = '#8b5cf6', color2 = '#ef4444', label1 = 'Value', label2 = 'Target', height = 240, dashed = false }: LineChartProps) {
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0))) * 1.2;
  const chartWidth = data.length * 70;
  const chartHeight = height - 50;

  const getPoint = (index: number, value: number) => {
    const x = (index / (data.length - 1)) * (chartWidth - 40) + 40;
    const y = height - 30 - (value / maxVal) * chartHeight;
    return { x, y };
  };

  const line1Points = data.map((d, i) => getPoint(i, d.value));
  const line2Points = data[0]?.value2 !== undefined ? data.map((d, i) => getPoint(i, d.value2!)) : [];

  const pathD = line1Points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L ${line1Points[line1Points.length - 1].x} ${height - 30} L ${line1Points[0].x} ${height - 30} Z`;

  const pathD2 = line2Points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - 30 - chartHeight * ratio;
          return (
            <g key={i}>
              <line x1="35" y1={y} x2={chartWidth} y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x="30" y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="8">
                {Math.round(maxVal * ratio)}
              </text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaD} fill={color} opacity="0.1" />
        {/* Line 1 */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots line 1 */}
        {line1Points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
        ))}
        {/* Line 2 (target) */}
        {line2Points.length > 0 && (
          <path d={pathD2} fill="none" stroke={color2} strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
        )}
        {/* Labels */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (chartWidth - 40) + 40;
          return (
            <text key={i} x={x} y={height - 10} textAnchor="middle" fill="#6b7280" fontSize="8">
              {d.label}
            </text>
          );
        })}
      </svg>
      <div className="flex justify-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
          {label1}
        </span>
        {line2Points.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-0.5" style={{ backgroundColor: color2, borderTop: `2px dashed ${color2}` }}></span>
            {label2}
          </span>
        )}
      </div>
    </div>
  );
}

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
}

export function PieChart({ data, height = 240 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = 100;
  const cy = 100;
  const outerR = 75;
  const innerR = 45;

  let currentAngle = -Math.PI / 2;

  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1Outer = cx + outerR * Math.cos(startAngle);
    const y1Outer = cy + outerR * Math.sin(startAngle);
    const x2Outer = cx + outerR * Math.cos(endAngle);
    const y2Outer = cy + outerR * Math.sin(endAngle);

    const x1Inner = cx + innerR * Math.cos(endAngle);
    const y1Inner = cy + innerR * Math.sin(endAngle);
    const x2Inner = cx + innerR * Math.cos(startAngle);
    const y2Inner = cy + innerR * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      'Z'
    ].join(' ');

    return { path, color: d.color, name: d.name, value: d.value, percentage: ((d.value / total) * 100).toFixed(0) };
  });

  return (
    <div className="flex flex-col items-center" style={{ minHeight: height }}>
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity cursor-pointer" />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#374151" fontSize="16" fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize="9">Total</text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }}></span>
            <span>{s.name} ({s.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AreaChartProps {
  data: { label: string; value: number; value2?: number }[];
  color?: string;
  color2?: string;
  label1?: string;
  label2?: string;
  height?: number;
}

export function AreaChart({ data, color = '#3b82f6', color2 = '#ef4444', label1 = 'Total', label2 = 'Emergency', height = 260 }: AreaChartProps) {
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0))) * 1.2;
  const chartWidth = data.length * 70;
  const chartHeight = height - 50;

  const getPoint = (index: number, value: number) => {
    const x = (index / (data.length - 1)) * (chartWidth - 60) + 50;
    const y = height - 30 - (value / maxVal) * chartHeight;
    return { x, y };
  };

  const points1 = data.map((d, i) => getPoint(i, d.value));
  const points2 = data[0]?.value2 !== undefined ? data.map((d, i) => getPoint(i, d.value2!)) : [];

  const makeArea = (points: { x: number; y: number }[]) => {
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return line + ` L ${points[points.length - 1].x} ${height - 30} L ${points[0].x} ${height - 30} Z`;
  };

  const makeLine = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - 30 - chartHeight * ratio;
          return (
            <g key={i}>
              <line x1="45" y1={y} x2={chartWidth} y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x="40" y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="8">
                {Math.round(maxVal * ratio)}
              </text>
            </g>
          );
        })}
        {/* Area 1 */}
        <path d={makeArea(points1)} fill={color} opacity="0.15" />
        <path d={makeLine(points1)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points1.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        ))}
        {/* Area 2 */}
        {points2.length > 0 && (
          <>
            <path d={makeArea(points2)} fill={color2} opacity="0.2" />
            <path d={makeLine(points2)} fill="none" stroke={color2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points2.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color2} stroke="white" strokeWidth="1.5" />
            ))}
          </>
        )}
        {/* Labels */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (chartWidth - 60) + 50;
          return (
            <text key={i} x={x} y={height - 10} textAnchor="middle" fill="#6b7280" fontSize="8">
              {d.label}
            </text>
          );
        })}
      </svg>
      <div className="flex justify-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
          {label1}
        </span>
        {points2.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color2 }}></span>
            {label2}
          </span>
        )}
      </div>
    </div>
  );
}
