interface Props {
  value: string;
  onChange: (v: string) => void;
  onSelect: (externalId: string) => void;
  results: { external_id: string; symbol: string; name: string }[];
}

export default function SearchBar({ value, onChange, onSelect, results }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search coin (BTC, ethereum...)"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "#e2e8f0",
        }}
      />
      {results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 8,
            marginTop: 4,
            listStyle: "none",
            padding: 0,
            zIndex: 10,
          }}
        >
          {results.map((r) => (
            <li
              key={r.external_id}
              onClick={() => onSelect(r.external_id)}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              <strong>{r.symbol.toUpperCase()}</strong> — {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}