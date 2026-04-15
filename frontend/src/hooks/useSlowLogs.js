import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useSlowLogs() {
    const [slowLogs, setSlowLogs] = useState([]);
    const [slowThreshold, setSlowThreshold] = useState(1000);
    const [slowServiceFilter, setSlowServiceFilter] = useState("");
    const [slowCurrentPage, setSlowCurrentPage] = useState(1);

    const fetchSlowLogs = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/logs/slow?ms=${slowThreshold}`);
            const data = await res.json();
            setSlowLogs(data.content ?? []);
            setSlowCurrentPage(1);
        } catch (err) {
            console.error("느린 로그 조회 실패:", err);
        }
    };

    return {
        slowLogs, slowThreshold, setSlowThreshold,
        slowServiceFilter, setSlowServiceFilter,
        slowCurrentPage, setSlowCurrentPage,
        fetchSlowLogs
    };
}