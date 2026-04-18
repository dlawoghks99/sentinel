import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useDashboard() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalCount: 0, errorCount: 0, avgResponseTime: 0, errorRate: 0 });
    const [hourlyStats, setHourlyStats] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState(null);

    const fetchDashboardData = useCallback(async (range) => {
        try {
            setLoading(true);
            setError("");

            const now = new Date();
            const offset = 9 * 60 * 60 * 1000;
            let startDate = null;
            if (range) {
                const start = new Date(now - range * 60 * 60 * 1000);
                startDate = new Date(start.getTime() + offset).toISOString().slice(0, 19);
            }
            const endDate = new Date(now.getTime() + offset + 60 * 1000).toISOString().slice(0, 19);

            const logsUrl = `${BASE_URL}/api/logs?page=0&size=100${startDate ? `&startDate=${startDate}&endDate=${endDate}` : ""}`;
            const statsUrl = `${BASE_URL}/api/logs/stats${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ""}`;

            const [logsRes, hourlyRes, statsRes] = await Promise.all([
                fetch(logsUrl),
                fetch(`${BASE_URL}/api/logs/stats/hourly`),
                fetch(statsUrl),
            ]);

            if (!logsRes.ok) throw new Error("로그 목록 API 호출 실패");
            if (!statsRes.ok) throw new Error("통계 API 호출 실패");

            const logsData = await logsRes.json();
            const hourlyData = await hourlyRes.json();
            const statsData = await statsRes.json();
            const content = logsData.content ?? [];

            setLogs(content);
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
    }, []);

    useEffect(() => {
        fetchDashboardData(timeRange);
        const interval = setInterval(() => fetchDashboardData(timeRange), 5000);
        return () => clearInterval(interval);
    }, [timeRange]);

    return { logs, stats, hourlyStats, error, loading, timeRange, setTimeRange, fetchDashboardData: () => fetchDashboardData(timeRange) };
}