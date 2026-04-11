import { useEffect, useMemo, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import TabBar from "./components/TabBar";
import AllLogsTab from "./components/AllLogsTab";
import ErrorLogsTab from "./components/ErrorLogsTab";
import SlowLogsTab from "./components/SlowLogsTab";
import ChartSection from "./components/ChartSection";

const BASE_URL = "http://localhost:8080";
const PAGE_SIZE = 5;

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, errorCount: 0, avgResponseTime: 0, errorRate: 0 });
  const [keyword, setKeyword] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorLogs, setErrorLogs] = useState([]);
  const [errorServiceName, setErrorServiceName] = useState("");
  const [errorKeyword, setErrorKeyword] = useState("");
  const [errorStartDate, setErrorStartDate] = useState("");
  const [errorEndDate, setErrorEndDate] = useState("");
  const [errorCurrentPage, setErrorCurrentPage] = useState(1);

  const [slowLogs, setSlowLogs] = useState([]);
  const [slowThreshold, setSlowThreshold] = useState(1000);
  const [slowServiceFilter, setSlowServiceFilter] = useState("");
  const [slowCurrentPage, setSlowCurrentPage] = useState(1);

  const [activeTab, setActiveTab] = useState("all");

  // ── fetch 함수들 ──────────────────────────────
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/logs?page=0&size=100`),
        fetch(`${BASE_URL}/api/logs/stats`),
      ]);
      if (!logsRes.ok) throw new Error("로그 목록 API 호출 실패");
      if (!statsRes.ok) throw new Error("통계 API 호출 실패");

      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setLogs(logsData.content ?? []);
      setStats({
        totalCount: statsData.totalCount ?? 0,
        errorCount: statsData.errorCount ?? 0,
        avgResponseTime: statsData.avgResponseTimeMs != null
            ? parseFloat(statsData.avgResponseTimeMs.toFixed(2)) : 0,
        errorRate: statsData.totalCount > 0
            ? ((statsData.errorCount / statsData.totalCount) * 100).toFixed(1) : 0,
      });
    } catch (err) {
      console.error(err);
      setError("백엔드 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

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

  const generateTestLogs = async () => {
    const levels = ["INFO", "INFO", "WARN", "ERROR", "ERROR"];
    const services = ["auth-service", "order-service", "payment-service", "user-service", "notification-service"];
    const messages = {
      INFO: ["요청 처리 완료", "사용자 로그인 성공", "데이터 조회 완료", "캐시 히트"],
      WARN: ["응답 지연 감지", "재시도 발생", "메모리 사용률 높음", "커넥션 풀 부족"],
      ERROR: ["NullPointerException 발생", "DB 연결 실패", "타임아웃 초과", "인증 실패"],
    };
    const count = Math.floor(Math.random() * 6) + 5;
    const requests = Array.from({ length: count }, () => {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const message = messages[level][Math.floor(Math.random() * messages[level].length)];
      const responseTimeMs = level === "ERROR" ? Math.floor(Math.random() * 3000) + 1000
          : level === "WARN" ? Math.floor(Math.random() * 800) + 300
              : Math.floor(Math.random() * 200) + 10;
      const statusCode = level === "ERROR" ? [500, 503, 504][Math.floor(Math.random() * 3)]
          : level === "WARN" ? 429 : 200;
      return fetch(`${BASE_URL}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: service, level, message, responseTimeMs, statusCode }),
      });
    });
    await Promise.all(requests);
    fetchDashboardData();
    fetchErrorLogs();
  };

  // ── useEffect ────────────────────────────────
  useEffect(() => { fetchDashboardData(); fetchErrorLogs(); }, []);

  useEffect(() => {
    if (activeTab === "all") fetchDashboardData();
    if (activeTab === "error") fetchErrorLogs();
    if (activeTab === "slow") fetchSlowLogs();
  }, [activeTab]);

  useEffect(() => { setCurrentPage(1); }, [keyword, serviceFilter]);
  useEffect(() => { setSlowCurrentPage(1); }, [slowServiceFilter]);

  // ── 파생 상태 ─────────────────────────────────
  const filteredLogs = useMemo(() => logs.filter((log) => {
    const kw = keyword.toLowerCase();
    const sv = serviceFilter.toLowerCase();
    return (!kw || log.message?.toLowerCase().includes(kw) || log.level?.toLowerCase().includes(kw))
        && (!sv || log.serviceName?.toLowerCase().includes(sv));
  }), [logs, keyword, serviceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const errorTotalPages = Math.max(1, Math.ceil(errorLogs.length / PAGE_SIZE));
  const paginatedErrorLogs = errorLogs.slice((errorCurrentPage - 1) * PAGE_SIZE, errorCurrentPage * PAGE_SIZE);

  const filteredSlowLogs = useMemo(() => {
    if (!slowServiceFilter) return slowLogs;
    return slowLogs.filter((log) => log.serviceName?.toLowerCase().includes(slowServiceFilter.toLowerCase()));
  }, [slowLogs, slowServiceFilter]);

  const slowTotalPages = Math.max(1, Math.ceil(filteredSlowLogs.length / PAGE_SIZE));
  const paginatedSlowLogs = filteredSlowLogs.slice((slowCurrentPage - 1) * PAGE_SIZE, slowCurrentPage * PAGE_SIZE);

  // ── render ────────────────────────────────────
  return (
      <div className="app">
        <div className="container">
          <Header onRefresh={fetchDashboardData} onGenerateTestLogs={generateTestLogs} />
          {error && <div className="error-text">{error}</div>}
          <StatsGrid stats={stats} />
          <ChartSection logs={logs} />
          <section className="panel">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === "all" && (
                <AllLogsTab
                    logs={paginatedLogs} loading={loading}
                    totalCount={filteredLogs.length}
                    keyword={keyword} setKeyword={setKeyword}
                    serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
                    currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
                />
            )}
            {activeTab === "error" && (
                <ErrorLogsTab
                    logs={paginatedErrorLogs}
                    totalCount={errorLogs.length}
                    serviceName={errorServiceName} setServiceName={setErrorServiceName}
                    keyword={errorKeyword} setKeyword={setErrorKeyword}
                    startDate={errorStartDate} setStartDate={setErrorStartDate}
                    endDate={errorEndDate} setEndDate={setErrorEndDate}
                    currentPage={errorCurrentPage} totalPages={errorTotalPages} onPageChange={setErrorCurrentPage}
                    onSearch={fetchErrorLogs}
                />
            )}
            {activeTab === "slow" && (
                <SlowLogsTab
                    logs={paginatedSlowLogs}
                    totalCount={filteredSlowLogs.length}
                    threshold={slowThreshold} setThreshold={setSlowThreshold}
                    serviceFilter={slowServiceFilter} setServiceFilter={setSlowServiceFilter}
                    currentPage={slowCurrentPage} totalPages={slowTotalPages} onPageChange={setSlowCurrentPage}
                    onSearch={fetchSlowLogs}
                />
            )}
          </section>
        </div>
      </div>
  );
}

export default App;