import { cn } from "@/lib/utils";
import { BAND_COLORS, BAND_FREQ, BANDS } from "../lib/neuro-utils";

export default function BandCard({ index, val }) {
  const name = BANDS[index];
  const freq = BAND_FREQ[index];
  const color = BAND_COLORS[index];
  const pct = Math.min(Math.round(val), 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-3 flex flex-col gap-1",
        "border border-white/[0.07] bg-card"
      )}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span
        className="text-[10px] font-mono px-2 py-0.5 rounded-full self-start"
        style={{
          background: `${color}22`,
          color,
          border: `1px solid ${color}44`,
        }}
      >
        {name}
      </span>
      <span className="text-[10px] text-muted-foreground font-mono">{freq}</span>
      <span className="text-xl font-bold tracking-tight" style={{ color }}>
        {Math.round(val)}
      </span>
      <span className="text-[10px] text-muted-foreground font-mono">μV²/Hz</span>
      <div className="h-[3px] rounded-full bg-white/5 mt-1">
        <div
          className="h-[3px] rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}