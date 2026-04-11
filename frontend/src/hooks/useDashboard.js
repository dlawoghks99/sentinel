import { useState } from "react";

const BASE_URL = "http://localhost:8080";

export function useDashboard() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalCount: 0, errorCount: 0, avgResponseTime: 0, errorRate: 0 });
    const [hourlyStats, setHourlyStats] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            // 로그 목록, 통계, 시간대별 통계 병렬 호출
            const [logsRes, statsRes, hourlyRes] = await Promise.all([
                fetch(`${BASE_URL}/api/logs?page=0&size=100`),
                fetch(`${BASE_URL}/api/logs/stats`),
                fetch(`${BASE_URL}/api/logs/stats/hourly`),
            ]);
            if (!logsRes.ok) throw new Error("로그 목록 API 호출 실패");
            if (!statsRes.ok) throw new Error("통계 API 호출 실패");

            const logsData = await logsRes.json();
            const statsData = await statsRes.json();
            const hourlyData = await hourlyRes.json();

            // 로그 목록 세팅
            setLogs(logsData.content ?? []);

            // 통계 세팅
            setStats({
                totalCount: statsData.totalCount ?? 0,
                errorCount: statsData.errorCount ?? 0,
                avgResponseTime: statsData.avgResponseTimeMs != null
                    ? parseFloat(statsData.avgResponseTimeMs.toFixed(2)) : 0,
                errorRate: statsData.totalCount > 0
                    ? ((statsData.errorCount / statsData.totalCount) * 100).toFixed(1) : 0,
            });

            // 시간대별 통계 세팅
            setHourlyStats(hourlyData);

        } catch (err) {
            console.error(err);
            setError("백엔드 연결에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return { logs, stats, hourlyStats, error, loading, fetchDashboardData };
}