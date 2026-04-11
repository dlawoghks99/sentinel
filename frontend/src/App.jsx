import { useEffect, useMemo, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import TabBar from "./components/TabBar";
import AllLogsTab from "./components/AllLogsTab";
import ErrorLogsTab from "./components/ErrorLogsTab";
import SlowLogsTab from "./components/SlowLogsTab";
import ChartSection from "./components/ChartSection";

import { useDashboard } from "./hooks/useDashboard";
import { useErrorLogs } from "./hooks/useErrorLogs";
import { useSlowLogs } from "./hooks/useSlowLogs";

const BASE_URL = "http://localhost:8080";
const PAGE_SIZE = 5;

function App() {
  // ── 커스텀 훅 ──────────────────────────────
  const { logs, stats, hourlyStats, error, loading, fetchDashboardData } = useDashboard();
  const {
    errorLogs, errorServiceName, setErrorServiceName,
    errorKeyword, setErrorKeyword,
    errorStartDate, setErrorStartDate,
    errorEndDate, setErrorEndDate,
    errorCurrentPage, setErrorCurrentPage,
    fetchErrorLogs
  } = useErrorLogs();
  const {
    slowLogs, slowThreshold, setSlowThreshold,
    slowServiceFilter, setSlowServiceFilter,
    slowCurrentPage, setSlowCurrentPage,
    fetchSlowLogs
  } = useSlowLogs();

  const [keyword, setKeyword] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  // ── 테스트 로그 생성 ──────────────────────────────
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
          <div style={{ overflow: "hidden" }}>
            <StatsGrid stats={stats} hourlyStats={hourlyStats}/>
            <ChartSection logs={logs} hourlyStats={hourlyStats} />
          </div>
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