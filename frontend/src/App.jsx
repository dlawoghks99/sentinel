import { useState } from "react";
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

function App() {
  // ── 커스텀 훅 ──────────────────────────────
  const {
    logs, stats, hourlyStats, error, loading,
    timeRange, setTimeRange,
    currentPage, setCurrentPage, totalElements, totalPages,
    keyword, setKeyword, serviceFilter, setServiceFilter,
    fetchDashboardData
  } = useDashboard();

  const {
    errorLogs,
    errorServiceName, setErrorServiceName,
    errorKeyword, setErrorKeyword,
    errorStartDate, setErrorStartDate,
    errorEndDate, setErrorEndDate,
    errorCurrentPage, setErrorCurrentPage,
    errorTotalElements,
    errorTotalPages,
  } = useErrorLogs();

  const {
    slowLogs,
    slowThreshold, setSlowThreshold,
    slowServiceFilter, setSlowServiceFilter,
    slowCurrentPage, setSlowCurrentPage,
    slowTotalElements,
    slowTotalPages,
  } = useSlowLogs();

  const [activeTab, setActiveTab] = useState("all");

  // ── render ────────────────────────────────────
  return (
      <div className="app">
        <div className="container">
          <Header onRefresh={fetchDashboardData} />
          {/* 시간 범위 선택 버튼 */}
          <div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
            {[
              { label: "전체", value: null },
              { label: "1시간", value: 1 },
              { label: "6시간", value: 6 },
              { label: "24시간", value: 24 },
              { label: "7일", value: 168 },
            ].map(({ label, value }) => (
                <button
                    key={label}
                    onClick={() => setTimeRange(value)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: timeRange === value ? "#4f46e5" : "#1e1e2e",
                      color: timeRange === value ? "#fff" : "#a0a0b0",
                      cursor: "pointer",
                      fontWeight: timeRange === value ? "bold" : "normal",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                >
                  {label}
                </button>
            ))}
          </div>
          {error && <div className="error-text">{error}</div>}
          <div style={{ overflow: "hidden" }}>
            <StatsGrid stats={stats} hourlyStats={hourlyStats}/>
            <ChartSection stats={stats} hourlyStats={hourlyStats} />
          </div>
          <section className="panel">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === "all" && (
                <AllLogsTab
                    logs={logs} loading={loading}
                    totalCount={totalElements}
                    keyword={keyword} setKeyword={setKeyword}
                    serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
                    currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
                />
            )}
            {activeTab === "error" && (
                <ErrorLogsTab
                    logs={errorLogs}
                    totalCount={errorTotalElements}
                    serviceName={errorServiceName} setServiceName={setErrorServiceName}
                    keyword={errorKeyword} setKeyword={setErrorKeyword}
                    startDate={errorStartDate} setStartDate={setErrorStartDate}
                    endDate={errorEndDate} setEndDate={setErrorEndDate}
                    currentPage={errorCurrentPage}
                    totalPages={errorTotalPages}
                    onPageChange={setErrorCurrentPage}
                />
            )}
            {activeTab === "slow" && (
                <SlowLogsTab
                    logs={slowLogs}
                    totalCount={slowTotalElements}
                    threshold={slowThreshold} setThreshold={setSlowThreshold}
                    serviceFilter={slowServiceFilter} setServiceFilter={setSlowServiceFilter}
                    currentPage={slowCurrentPage}
                    totalPages={slowTotalPages}
                    onPageChange={setSlowCurrentPage}
                />
            )}
          </section>
        </div>
      </div>
  );
}

export default App;