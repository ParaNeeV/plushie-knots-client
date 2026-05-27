interface WaveDividerProps {
  fromColor: string;
  toColor: string;
  flip?: boolean;
}

export default function WaveDivider({ fromColor, toColor, flip = false }: WaveDividerProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100px" }}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`absolute w-full h-full ${flip ? "scale-y-[-1]" : ""}`}
        style={{
          background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
        }}
      >
        <path
          d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z"
          fill={toColor}
          className="wave-path"
          opacity="0.8"
        />
        <path
          d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
          fill={toColor}
          className="wave-path"
          opacity="0.5"
          style={{ animationDelay: "0.5s" }}
        />
      </svg>
    </div>
  );
}
