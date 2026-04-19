import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

export default function ChartSection({ stats, hourlyStats }) {
    // ⭐ 안전 장치: stats 가 아직 로딩 중일 때 기본값
    const levelDist = stats.levelDistribution ?? { info: 0, warn: 0, error: 0 };
    const serviceDist = stats.serviceDistribution ?? {};
    const timeDist = stats.responseTimeDistribution ?? { fast: 0, normal: 0, slow: 0 };

    // ─── 1. 도넛 차트: 레벨별 분포 ───
    const doughnutData = {
        labels: ["INFO", "WARN", "ERROR"],
        datasets: [{
            data: [levelDist.info, levelDist.warn, levelDist.error],
            backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444"],
            borderWidth: 0,
        }],
    };

    // ─── 2. 막대 차트: 서비스별 분포 ───
    const barData = {
        labels: Object.keys(serviceDist),
        datasets: [{
            label: "로그 수",
            data: Object.values(serviceDist),
            backgroundColor: "#3b82f680",
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 4,
        }],
    };

    // ─── 3. 막대 차트: 응답시간 분포 ───
    const responseTimeData = {
        labels: ["빠름 (~200ms)", "보통 (200~1000ms)", "느림 (1000ms+)"],
        datasets: [{
            label: "로그 수",
            data: [timeDist.fast, timeDist.normal, timeDist.slow],
            backgroundColor: ["#10b98180", "#f59e0b80", "#ef444480"],
            borderColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 1,
            borderRadius: 4,
        }],
    };

    // ─── 4. 라인 차트: 시간대별 추이 (그대로 유지) ───
    const lineData = {
        labels: hourlyStats.map(s => s.hour),
        datasets: [
            {
                label: "전체",
                data: hourlyStats.map(s => s.total),
                borderColor: "#3b82f6",
                backgroundColor: "#3b82f620",
                tension: 0.4,
                fill: true,
            },
            {
                label: "에러",
                data: hourlyStats.map(s => s.errorCount),
                borderColor: "#ef4444",
                backgroundColor: "#ef444420",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // ─── 차트 공통 옵션 (그대로) ───
    const baseOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: "#94a3b8", font: { size: 11, weight: "500"} }
            }
        },
        scales: {
            x: {
                ticks: { color: "#64748b", font: { size: 9, weight: "500" }, maxRotation: 0 },
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
        <div style={{ margin: "1.5rem 0", padding: "1.5rem", background: "#1e2130", borderRadius: "12px", overflow: "hidden" }}>
            <p style={{ color: "#64748b", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                로그 분석
            </p>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                <div style={{ height: "250px" }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0.5rem" }}>레벨별 분포</p>
                    <Doughnut data={doughnutData} options={doughnutOptions} redraw />
                </div>
                <div style={{ height: "280px" }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0.5rem" }}>서비스별 로그 수</p>
                    <Bar data={barData} options={baseOptions} redraw />
                </div>
                <div style={{ height: "250px" }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0.5rem" }}>응답시간 분포</p>
                    <Bar data={responseTimeData} options={baseOptions} redraw />
                </div>
                <div style={{ height: "250px" }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0.5rem" }}>시간대별 로그 추이</p>
                    <Line data={lineData} options={baseOptions} redraw />
                </div>
            </div>
        </div>
    );
}