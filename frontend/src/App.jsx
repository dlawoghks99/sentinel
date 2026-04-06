import { useEffect, useMemo, useState } from "react";
import "./App.css";

const BASE_URL = "http://localhost:8080";

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    errorCount: 0,
    avgResponseTime: 0,
    errorRate: 0,
  });
  const [keyword, setKeyword] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
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

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  const generateTestLogs = async () => {
    const levels = ["INFO", "INFO", "WARN", "ERROR", "ERROR"];
    const services = ["auth-service", "order-service", "payment-service", "user-service", "notification-service"];
    const messages = {
      INFO: ["요청 처리 완료", "사용자 로그인 성공", "데이터 조회 완료", "캐시 히트"],
      WARN: ["응답 지연 감지", "재시도 발생", "메모리 사용률 높음", "커넥션 풀 부족"],
      ERROR: ["NullPointerException 발생", "DB 연결 실패", "타임아웃 초과", "인증 실패"],
    };

    const count = Math.floor(Math.random() * 6) + 5; // 5~10개
    const requests = Array.from({ length: count }, () => {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const msgList = messages[level];
      const message = msgList[Math.floor(Math.random() * msgList.length)];
      const responseTimeMs = level === "ERROR" ? Math.floor(Math.random() * 3000) + 1000
                           : level === "WARN"  ? Math.floor(Math.random() * 800) + 300
                                               : Math.floor(Math.random() * 200) + 10;
      const statusCode = level === "ERROR" ? [500, 503, 504][Math.floor(Math.random() * 3)]
                       : level === "WARN"  ? 429
                                           : 200;

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

  const fetchSlowLogs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/logs/slow?ms=${slowThreshold}`);
      const data = await response.json();
      setSlowLogs(Array.isArray(data) ? data : []);
      setSlowCurrentPage(1);
    } catch (err) {
      console.error("느린 로그 조회 실패:", err);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      const params = new URLSearchParams();

      if (errorServiceName.trim()) {
        params.append("serviceName", errorServiceName);
      }

      if (errorKeyword.trim()) {
        params.append("keyword", errorKeyword);
      }

      if (errorStartDate) {
        params.append("startDate", `${errorStartDate}:00`);
      }

      if (errorEndDate) {
        params.append("endDate", `${errorEndDate}:00`);
      }

      const queryString = params.toString();
      const url = queryString
          ? `${BASE_URL}/api/logs/error?${queryString}`
          : `${BASE_URL}/api/logs/error`;

      const response = await fetch(url);
      const data = await response.json();
      setErrorLogs(data);
    } catch (error) {
      console.error("에러 로그 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [logsRes, statsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/logs`),
        fetch(`${BASE_URL}/api/logs/stats`),
      ]);

      if (!logsRes.ok) {
        throw new Error("로그 목록 API 호출 실패");
      }

      if (!statsRes.ok) {
        throw new Error("통계 API 호출 실패");
      }

      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setLogs(Array.isArray(logsData) ? logsData : []);
      setStats({
        totalCount: statsData.totalCount ?? 0,
        errorCount: statsData.errorCount ?? 0,
        avgResponseTime: statsData.avgResponseTimeMs != null ? parseFloat(statsData.avgResponseTimeMs.toFixed(2)) : 0,
        errorRate:
            statsData.totalCount > 0
                ? ((statsData.errorCount / statsData.totalCount) * 100).toFixed(1)
                : 0,
      });
    } catch (err) {
      console.error(err);
      setError("백엔드 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all") fetchDashboardData();
    if (activeTab === "error") fetchErrorLogs();
    if (activeTab === "slow") fetchSlowLogs();
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, serviceFilter]);

  useEffect(() => {
    setSlowCurrentPage(1);
  }, [slowServiceFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const lowerKeyword = keyword.toLowerCase();
      const lowerService = serviceFilter.toLowerCase();

      const matchesKeyword =
          !lowerKeyword ||
          (log.message ?? "").toLowerCase().includes(lowerKeyword) ||
          (log.level ?? "").toLowerCase().includes(lowerKeyword);

      const matchesService =
          !lowerService ||
          (log.serviceName ?? "").toLowerCase().includes(lowerService);

      return matchesKeyword && matchesService;
    });
  }, [logs, keyword, serviceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const errorTotalPages = Math.max(1, Math.ceil(errorLogs.length / PAGE_SIZE));
  const paginatedErrorLogs = errorLogs.slice((errorCurrentPage - 1) * PAGE_SIZE, errorCurrentPage * PAGE_SIZE);

  const filteredSlowLogs = useMemo(() => {
    if (!slowServiceFilter) return slowLogs;
    return slowLogs.filter((log) =>
      (log.serviceName ?? "").toLowerCase().includes(slowServiceFilter.toLowerCase())
    );
  }, [slowLogs, slowServiceFilter]);

  const slowTotalPages = Math.max(1, Math.ceil(filteredSlowLogs.length / PAGE_SIZE));
  const paginatedSlowLogs = filteredSlowLogs.slice((slowCurrentPage - 1) * PAGE_SIZE, slowCurrentPage * PAGE_SIZE);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR");
  };

  return (
      <div className="app">
        <div className="container">
          <header className="header">
            <h1>Sentinel 대시보드</h1>
            <p>로그 조회와 서비스 상태를 한눈에 보는 모니터링 화면</p>
            <button className="refresh-button" onClick={fetchDashboardData}>
              새로고침
            </button>
            <button className="refresh-button" style={{ marginLeft: "10px", background: "var(--muted)" }} onClick={generateTestLogs}>
              테스트 로그 생성
            </button>
          </header>

          {error && <div className="error-text">{error}</div>}

          <section className="stats-grid">
            <div className="stat-card">
              <h3>총 로그 수</h3>
              <div className="stat-value">{stats.totalCount}</div>
              <div className="stat-desc">전체 수집 로그</div>
            </div>

            <div className="stat-card">
              <h3>에러 로그 수</h3>
              <div className="stat-value">{stats.errorCount}</div>
              <div className="stat-desc">ERROR 레벨 기준</div>
            </div>

            <div className="stat-card">
              <h3>평균 응답시간</h3>
              <div className="stat-value">{stats.avgResponseTime} ms</div>
              <div className="stat-desc">전체 로그 평균</div>
            </div>

            <div className="stat-card">
              <h3>에러 비율</h3>
              <div className="stat-value">{stats.errorRate}%</div>
              <div className="stat-desc">errorCount / totalCount</div>
            </div>
          </section>

          <section className="panel">
            <div className="tab-bar">
              {[
                { key: "all", label: "전체 로그" },
                { key: "error", label: "에러 로그" },
                { key: "slow", label: "느린 로그" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "all" && (
              <>
                <div className="filter-row">
                  <input className="input" type="text" placeholder="메시지 / 레벨 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                  <input className="input" type="text" placeholder="서비스명 필터" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} />
                </div>
                <div className="table-top">
                  <span className="table-count">{loading ? "불러오는 중..." : `총 ${filteredLogs.length}건`}</span>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>레벨</th><th>메시지</th><th>응답시간</th><th>서비스명</th><th>상태코드</th><th>생성시각</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogs.length > 0 ? paginatedLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td><span className={log.level === "ERROR" ? "level-badge error" : "level-badge"}>{log.level}</span></td>
                          <td>{log.message}</td>
                          <td>{log.responseTimeMs} ms</td>
                          <td>{log.serviceName}</td>
                          <td>{log.statusCode}</td>
                          <td>{formatDate(log.createdAt)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="empty-text">조회된 로그가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>이전</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} className={`page-btn ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)}>{page}</button>
                    ))}
                    <button className="page-btn" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>다음</button>
                  </div>
                )}
              </>
            )}

            {activeTab === "error" && (
              <>
                <div className="filter-row">
                  <input className="input" type="text" placeholder="서비스명" value={errorServiceName} onChange={(e) => setErrorServiceName(e.target.value)} />
                  <input className="input" type="text" placeholder="키워드" value={errorKeyword} onChange={(e) => setErrorKeyword(e.target.value)} />
                  <input className="input" type="datetime-local" value={errorStartDate} onChange={(e) => setErrorStartDate(e.target.value)} />
                  <input className="input" type="datetime-local" value={errorEndDate} onChange={(e) => setErrorEndDate(e.target.value)} />
                </div>
                <div className="table-top">
                  <span className="table-count">총 {errorLogs.length}건</span>
                  <button className="refresh-button" onClick={() => { setErrorCurrentPage(1); fetchErrorLogs(); }}>에러 로그 조회</button>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>레벨</th><th>메시지</th><th>서비스명</th><th>상태코드</th><th>생성시각</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedErrorLogs.length > 0 ? paginatedErrorLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td><span className={log.level === "ERROR" ? "level-badge error" : "level-badge"}>{log.level}</span></td>
                          <td>{log.message}</td>
                          <td>{log.serviceName}</td>
                          <td>{log.statusCode}</td>
                          <td>{formatDate(log.createdAt)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" className="empty-text">에러 로그가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {errorTotalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => setErrorCurrentPage((p) => p - 1)} disabled={errorCurrentPage === 1}>이전</button>
                    {Array.from({ length: errorTotalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} className={`page-btn ${errorCurrentPage === page ? "active" : ""}`} onClick={() => setErrorCurrentPage(page)}>{page}</button>
                    ))}
                    <button className="page-btn" onClick={() => setErrorCurrentPage((p) => p + 1)} disabled={errorCurrentPage === errorTotalPages}>다음</button>
                  </div>
                )}
              </>
            )}

            {activeTab === "slow" && (
              <>
                <div className="filter-row">
                  <input className="input" type="number" placeholder="기준 응답시간 (ms)" value={slowThreshold} onChange={(e) => setSlowThreshold(Number(e.target.value))} />
                  <input className="input" type="text" placeholder="서비스명 필터" value={slowServiceFilter} onChange={(e) => setSlowServiceFilter(e.target.value)} />
                </div>
                <div className="table-top">
                  <span className="table-count">총 {filteredSlowLogs.length}건</span>
                  <button className="refresh-button" onClick={fetchSlowLogs}>느린 로그 조회</button>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>레벨</th><th>메시지</th><th>응답시간</th><th>서비스명</th><th>상태코드</th><th>생성시각</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSlowLogs.length > 0 ? paginatedSlowLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td><span className={log.level === "ERROR" ? "level-badge error" : "level-badge"}>{log.level}</span></td>
                          <td>{log.message}</td>
                          <td>{log.responseTimeMs} ms</td>
                          <td>{log.serviceName}</td>
                          <td>{log.statusCode}</td>
                          <td>{formatDate(log.createdAt)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="empty-text">조회된 느린 로그가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {slowTotalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => setSlowCurrentPage((p) => p - 1)} disabled={slowCurrentPage === 1}>이전</button>
                    {Array.from({ length: slowTotalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} className={`page-btn ${slowCurrentPage === page ? "active" : ""}`} onClick={() => setSlowCurrentPage(page)}>{page}</button>
                    ))}
                    <button className="page-btn" onClick={() => setSlowCurrentPage((p) => p + 1)} disabled={slowCurrentPage === slowTotalPages}>다음</button>
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </div>
  );
}

export default App;