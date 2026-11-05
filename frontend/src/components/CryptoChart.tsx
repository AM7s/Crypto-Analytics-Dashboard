import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { HistoryPoint } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  history: HistoryPoint[];
  symbol: string;
}

export default function CryptoChart({ history, symbol }: Props) {
  const data = {
    labels: history.map((p) => new Date(p.recorded_at).toLocaleTimeString()),
    datasets: [
      {
        label: `${symbol}/USD`,
        data: history.map((p) => p.price_usd),
        borderColor: "#1e1e24",
        backgroundColor: "rgba(30, 30, 36, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: { display: false },
          y: {
            display: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: { color: "#666", font: { size: 10 } },
          },
        },
      }}
    />
  );
}