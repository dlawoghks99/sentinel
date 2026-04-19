import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useSlowLogs() {
    const [slowLogs, setSlowLogs] = useState([]);
    const [slowThreshold, setSlowThreshold] = useState(1000);
    const [slowServiceFilter, setSlowServiceFilter] = useState("");

    // 페이지네이션 상태
    const [slowCurrentPage, setSlowCurrentPage] = useState(1);
    const [slowPageSize] = useState(5);
    const [slowTotalElements, setSlowTotalElements] = useState(0);
    const [slowTotalPages, setSlowTotalPages] = useState(0);

    // 디바운스 상태
    const [debouncedThreshold, setDebouncedThreshold] = useState(1000);
    const [debouncedServiceFilter, setDebouncedServiceFilter] = useState("");

    // 디바운싱
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedThreshold(slowThreshold);
            setDebouncedServiceFilter(slowServiceFilter);
            setSlowCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [slowThreshold, slowServiceFilter]);

    const fetchSlowLogs = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            params.set("ms", debouncedThreshold.toString());
            params.set("page", (slowCurrentPage - 1).toString());
            params.set("size", slowPageSize.toString());
            if (debouncedServiceFilter.trim()) {
                params.set("serviceName", debouncedServiceFilter);
            }

            const res = await fetch(`${BASE_URL}/api/logs/slow?${params.toString()}`);
            const data = await res.json();

            setSlowLogs(data.content ?? []);
            setSlowTotalElements(data.page?.totalElements ?? 0);
            setSlowTotalPages(data.page?.totalPages ?? 0);
        } catch (err) {
            console.error("느린 로그 조회 실패:", err);
        }
    }, [debouncedThreshold, debouncedServiceFilter, slowCurrentPage, slowPageSize]);

    // 자동 호출
    useEffect(() => {
        fetchSlowLogs();
    }, [fetchSlowLogs]);

    return {
        slowLogs,
        slowThreshold, setSlowThreshold,
        slowServiceFilter, setSlowServiceFilter,
        slowCurrentPage, setSlowCurrentPage,
        slowTotalElements,
        slowTotalPages,
        fetchSlowLogs,
    };
}