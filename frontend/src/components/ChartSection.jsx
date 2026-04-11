import { Doughnut, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ChartSection({ logs }) {
    const levelCounts = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
    }, {});

    const doughnutData = {
        labels: Object.keys(levelCounts),
        datasets: [{
            data: Object.values(levelCounts),
            backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"],
            borderWidth: 0,
        }],
    };

    const serviceCount = logs.reduce((acc, log) => {
        if (log.serviceName) acc[log.serviceName] = (acc[log.serviceName] || 0) + 1;
        return acc;
    }, {});

    const barData = {
        labels: Object.keys(serviceCount),
        datasets: [{
            label: "로그 수",
            data: Object.values(serviceCount),
            backgroundColor: "#3b82f680",
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 4,
        }],
    };

    const responseTimeData = {
        labels: ["빠름 (~200ms)", "보통 (200~1000ms)", "느림 (1000ms+)"],
        datasets: [{
            label: "로그 수",
            data: [
                logs.filter(l => l.responseTimeMs !== null && l.responseTimeMs <= 200).length,
                logs.filter(l => l.responseTimeMs !== null && l.responseTimeMs > 200 && l.responseTimeMs <= 1000).length,
                logs.filter(l => l.responseTimeMs !== null && l.responseTimeMs > 1000).length,
            ],
            backgroundColor: ["#10b98180", "#f59e0b80", "#ef444480"],
            borderColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 1,
            borderRadius: 4,
        }],
    };

    const baseOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: "#94a3b8", font: { size: 11, weight: "500"} }
            }
        },
        scales: {
            x: {
                ticks: { color: "#64748b", font: { size: 10, weight: "500" } },
                grid: { color: "#ffffff10" },
            },
            y: {
                ticks: { color: "#64748b", font: { size: 10, weight: "500" } },
                grid: { color: "#ffffff10" },
            },
        },
        layout: {
            padding: { bottom: 10 }
        }
    };

    const doughnutOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: { color: "#94a3b8", font: { size: 11, weight: "500" }, padding: 12 }
            }
        },
    };

    return (
        <div style={{ margin: "1.5rem 0", padding: "1.5rem", background: "#1e2130", borderRadius: "12px" }}>
            <p style={{ color: "#64748b", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                로그 분석
            </p>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ flex: 1, height: "200px" }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0.5rem" }}>레벨별 분포</p>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
                <div style={{ flex: 2, height: "200px" }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0.5rem" }}>서비스별 로그 수</p>
                    <Bar data={barData} options={baseOptions} />
                </div>
            </div>
            <div style={{ height: "200px", overflow: "visible" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0.5rem" }}>응답시간 분포</p>
                <Bar data={responseTimeData} options={baseOptions} />
            </div>
        </div>
    );
}