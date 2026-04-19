import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useDashboard() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        totalCount: 0,
        errorCount: 0,
        avgResponseTime: 0,
        errorRate: 0,
        levelDistribution: { info: 0, warn: 0, error: 0 },
        serviceDistribution: {},
        responseTimeDistribution: { fast: 0, normal: 0, slow: 0 },
    });
    const [hourlyStats, setHourlyStats] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState(null);

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ⭐ 검색 상태 추가
    const [keyword, setKeyword] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");

    // ⭐ 디바운스된 검색 상태 (실제 API 에 전송되는 값)
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [debouncedServiceFilter, setDebouncedServiceFilter] = useState("");

    // ⭐ 디바운싱: 사용자 타이핑 멈추고 300ms 후에 실제 검색어 변경
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(keyword);
            setDebouncedServiceFilter(serviceFilter);
            setCurrentPage(1); // 검색어 바뀌면 1페이지로
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword, serviceFilter]);

    const fetchDashboardData = useCallback(async (range, page, kw, sv) => {
        try {
            setLoading(true);
            setError("");

            const now = new Date();
            let startDate = null;
            if (range) {
                const start = new Date(now.getTime() - range * 60 * 60 * 1000);
                startDate = start.toISOString().slice(0, 19);
            }
            const endDate = now.toISOString().slice(0, 19);

            // 1-based UI → 0-based API
            const apiPage = (page ?? 1) - 1;

            // ⭐ URL 파라미터 빌드
            const params = new URLSearchParams();
            params.set("page", apiPage.toString());
            params.set("size", pageSize.toString());
            if (kw) params.set("keyword", kw);
            if (sv) params.set("serviceName", sv);
            if (startDate) {
                params.set("startDate", startDate);
                params.set("endDate", endDate);
            }

            const logsUrl = `${BASE_URL}/api/logs?${params.toString()}`;
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
            setTotalElements(logsData.page?.totalElements ?? 0);
            setTotalPages(logsData.page?.totalPages ?? 0);

            setStats({
                totalCount: statsData.totalCount ?? 0,
                errorCount: statsData.errorCount ?? 0,
                avgResponseTime: statsData.avgResponseTimeMs != null
                    ? parseFloat(statsData.avgResponseTimeMs.toFixed(2)) : 0,
                errorRate: statsData.totalCount > 0
                    ? ((statsData.errorCount / statsData.totalCount) * 100).toFixed(1) : 0,
                levelDistribution: statsData.levelDistribution ?? { info: 0, warn: 0, error: 0 },
                serviceDistribution: statsData.serviceDistribution ?? {},
                responseTimeDistribution: statsData.responseTimeDistribution ?? { fast: 0, normal: 0, slow: 0 },
            });
            setHourlyStats(hourlyData);

        } catch (err) {
            console.error(err);
            setError("백엔드 연결에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    // ⭐ timeRange / currentPage / debouncedKeyword / debouncedServiceFilter 변경 시 재호출
    useEffect(() => {
        fetchDashboardData(timeRange, currentPage, debouncedKeyword, debouncedServiceFilter);
        const interval = setInterval(
            () => fetchDashboardData(timeRange, currentPage, debouncedKeyword, debouncedServiceFilter),
            5000
        );
        return () => clearInterval(interval);
    }, [timeRange, currentPage, debouncedKeyword, debouncedServiceFilter, fetchDashboardData]);

    // timeRange 바뀌면 1페이지로 리셋
    const changeTimeRange = useCallback((range) => {
        setTimeRange(range);
        setCurrentPage(1);
    }, []);

    return {
        logs,
        stats,
        hourlyStats,
        error,
        loading,
        timeRange,
        setTimeRange: changeTimeRange,
        // 페이지네이션
        currentPage,
        setCurrentPage,
        pageSize,
        totalElements,
        totalPages,
        // ⭐ 검색
        keyword,
        setKeyword,
        serviceFilter,
        setServiceFilter,
        fetchDashboardData: () => fetchDashboardData(timeRange, currentPage, debouncedKeyword, debouncedServiceFilter),
    };
}