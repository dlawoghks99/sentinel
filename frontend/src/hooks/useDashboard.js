import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useDashboard() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalCount: 0, errorCount: 0, avgResponseTime: 0, errorRate: 0 });
    const [hourlyStats, setHourlyStats] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState(null); // null = 전체

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const now = new Date();
            let startDate = null;
            if (timeRange) {
                const start = new Date(now - timeRange * 60 * 60 * 1000);
                startDate = start.toISOString().slice(0, 19);
            }
            const endDate = now.toISOString().slice(0, 19);

            const params = new URLSearchParams({ page: 0, size: 100 });
            if (startDate) params.append("startDate", startDate);
            if (timeRange) params.append("endDate", endDate);

            const [logsRes, statsRes, hourlyRes] = await Promise.all([
                fetch(`${BASE_URL}/api/logs?${params}`),
                fetch(`${BASE_URL}/api/logs/stats`),
                fetch(`${BASE_URL}/api/logs/stats/hourly`),
            ]);

            if (!logsRes.ok) throw new Error("로그 목록 API 호출 실패");
            if (!statsRes.ok) throw new Error("통계 API 호출 실패");

            const logsData = await logsRes.json();
            const statsData = await statsRes.json();
            const hourlyData = await hourlyRes.json();

            setLogs(logsData.content ?? []);
            setStats({
                totalCount: statsData.totalCount ?? 0,
                errorCount: statsData.errorCount ?? 0,
                avgResponseTime: statsData.avgResponseTimeMs != null
                    ? parseFloat(statsData.avgResponseTimeMs.toFixed(2)) : 0,
                errorRate: statsData.totalCount > 0
                    ? ((statsData.errorCount / statsData.totalCount) * 100).toFixed(1) : 0,
            });
            setHourlyStats(hourlyData);

        } catch (err) {
            console.error(err);
            setError("백엔드 연결에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 5초마다 자동 갱신
    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, [timeRange]);

    return { logs, stats, hourlyStats, error, loading, timeRange, setTimeRange, fetchDashboardData };
}