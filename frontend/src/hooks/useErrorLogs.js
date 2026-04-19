import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useErrorLogs() {
    const [errorLogs, setErrorLogs] = useState([]);
    const [errorServiceName, setErrorServiceName] = useState("");
    const [errorKeyword, setErrorKeyword] = useState("");
    const [errorStartDate, setErrorStartDate] = useState("");
    const [errorEndDate, setErrorEndDate] = useState("");

    // 페이지네이션 상태
    const [errorCurrentPage, setErrorCurrentPage] = useState(1);
    const [errorPageSize] = useState(5);
    const [errorTotalElements, setErrorTotalElements] = useState(0);
    const [errorTotalPages, setErrorTotalPages] = useState(0);

    // 디바운스된 검색 상태
    const [debouncedServiceName, setDebouncedServiceName] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");

    // 디바운싱: 타이핑 필드만 적용
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedServiceName(errorServiceName);
            setDebouncedKeyword(errorKeyword);
            setErrorCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [errorServiceName, errorKeyword]);

    // 날짜는 디바운싱 없이 즉시 반영 (수동 입력이라 타이핑 이슈 없음)
    useEffect(() => {
        setErrorCurrentPage(1);
    }, [errorStartDate, errorEndDate]);

    const fetchErrorLogs = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            params.set("page", (errorCurrentPage - 1).toString());
            params.set("size", errorPageSize.toString());
            if (debouncedServiceName.trim()) params.set("serviceName", debouncedServiceName);
            if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword);
            if (errorStartDate) params.set("startDate", `${errorStartDate}:00`);
            if (errorEndDate) params.set("endDate", `${errorEndDate}:00`);

            const res = await fetch(`${BASE_URL}/api/logs/error?${params.toString()}`);
            const data = await res.json();

            setErrorLogs(data.content ?? []);
            setErrorTotalElements(data.page?.totalElements ?? 0);
            setErrorTotalPages(data.page?.totalPages ?? 0);
        } catch (err) {
            console.error("에러 로그 조회 실패:", err);
        }
    }, [errorCurrentPage, errorPageSize, debouncedServiceName, debouncedKeyword, errorStartDate, errorEndDate]);

    // 필터/페이지 변경 시 자동 재호출
    useEffect(() => {
        fetchErrorLogs();
    }, [fetchErrorLogs]);

    return {
        errorLogs,
        errorServiceName, setErrorServiceName,
        errorKeyword, setErrorKeyword,
        errorStartDate, setErrorStartDate,
        errorEndDate, setErrorEndDate,
        errorCurrentPage, setErrorCurrentPage,
        errorTotalElements,
        errorTotalPages,
        fetchErrorLogs,
    };
}