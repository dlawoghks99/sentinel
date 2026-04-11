import { useState } from "react";

const BASE_URL = "http://localhost:8080";

export function useErrorLogs() {
    const [errorLogs, setErrorLogs] = useState([]);
    const [errorServiceName, setErrorServiceName] = useState("");
    const [errorKeyword, setErrorKeyword] = useState("");
    const [errorStartDate, setErrorStartDate] = useState("");
    const [errorEndDate, setErrorEndDate] = useState("");
    const [errorCurrentPage, setErrorCurrentPage] = useState(1);

    const fetchErrorLogs = async () => {
        try {
            const params = new URLSearchParams();
            if (errorServiceName.trim()) params.append("serviceName", errorServiceName);
            if (errorKeyword.trim()) params.append("keyword", errorKeyword);
            if (errorStartDate) params.append("startDate", `${errorStartDate}:00`);
            if (errorEndDate) params.append("endDate", `${errorEndDate}:00`);
            const qs = params.toString();
            const res = await fetch(qs ? `${BASE_URL}/api/logs/error?${qs}` : `${BASE_URL}/api/logs/error`);
            const data = await res.json();
            setErrorLogs(data.content ?? []);
            setErrorCurrentPage(1);
        } catch (err) {
            console.error("에러 로그 조회 실패:", err);
        }
    };

    return {
        errorLogs, errorServiceName, setErrorServiceName,
        errorKeyword, setErrorKeyword,
        errorStartDate, setErrorStartDate,
        errorEndDate, setErrorEndDate,
        errorCurrentPage, setErrorCurrentPage,
        fetchErrorLogs
    };
}