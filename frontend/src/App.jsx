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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState([]);

  const [errorServiceName, setErrorServiceName] = useState("");
  const [errorKeyword, setErrorKeyword] = useState("");
  const [errorStartDate, setErrorStartDate] = useState("");
  const [errorEndDate, setErrorEndDate] = useState("");

  useEffect(() => {
    fetchErrorLogs();
  }, []);

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
        avgResponseTime: statsData.avgResponseTimeMs ?? 0,
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

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchTarget =
          `${log.message ?? ""} ${log.level ?? ""} ${log.serviceName ?? ""}`.toLowerCase();

      const matchesKeyword = searchTarget.includes(keyword.toLowerCase());
      const matchesService = (log.serviceName ?? "")
          .toLowerCase()
          .includes(serviceFilter.toLowerCase());

      return matchesKeyword && matchesService;
    });
  }, [logs, keyword, serviceFilter]);

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
            <div className="panel-header">
              <h2>로그 목록</h2>
              <p>메시지, 레벨, 서비스명으로 검색할 수 있습니다.</p>
            </div>

            <div className="filter-row">
              <input
                  className="input"
                  type="text"
                  placeholder="메시지 / 레벨 검색"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
              />
              <input
                  className="input"
                  type="text"
                  placeholder="서비스명 필터"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
              />
            </div>

            <div className="table-top">
            <span className="table-count">
              {loading ? "불러오는 중..." : `총 ${filteredLogs.length}건`}
            </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>레벨</th>
                  <th>메시지</th>
                  <th>응답시간</th>
                  <th>서비스명</th>
                  <th>상태코드</th>
                  <th>생성시각</th>
                </tr>
                </thead>
                <tbody>
                {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td>
                        <span
                            className={
                              log.level === "ERROR"
                                  ? "level-badge error"
                                  : "level-badge"
                            }
                        >
                          {log.level}
                        </span>
                          </td>
                          <td>{log.message}</td>
                          <td>{log.responseTimeMs} ms</td>
                          <td>{log.serviceName}</td>
                          <td>{log.statusCode}</td>
                          <td>{formatDate(log.createdAt)}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="7" className="empty-text">
                        조회된 로그가 없습니다.
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>에러 로그</h2>
              <p>백엔드 /api/logs/error 응답 확인용</p>
            </div>

            <div className="filter-row">
              <input
                  className="input"
                  type="text"
                  placeholder="에러 서비스명"
                  value={errorServiceName}
                  onChange={(e) => setErrorServiceName(e.target.value)}
              />
              <input
                  className="input"
                  type="text"
                  placeholder="에러 키워드"
                  value={errorKeyword}
                  onChange={(e) => setErrorKeyword(e.target.value)}
              />
              <input
                  className="input"
                  type="datetime-local"
                  value={errorStartDate}
                  onChange={(e) => setErrorStartDate(e.target.value)}
              />
              <input
                  className="input"
                  type="datetime-local"
                  value={errorEndDate}
                  onChange={(e) => setErrorEndDate(e.target.value)}
              />
            </div>

            <div className="table-top">
              <span className="table-count">총 {errorLogs.length}건</span>
              <button className="refresh-button" onClick={fetchErrorLogs}>
                에러 로그 조회
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>레벨</th>
                  <th>메시지</th>
                  <th>서비스명</th>
                  <th>상태코드</th>
                  <th>생성시각</th>
                </tr>
                </thead>
                <tbody>
                {errorLogs.length > 0 ? (
                    errorLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td>
                <span
                    className={
                      log.level === "ERROR"
                          ? "level-badge error"
                          : "level-badge"
                    }
                >
                  {log.level}
                </span>
                          </td>
                          <td>{log.message}</td>
                          <td>{log.serviceName}</td>
                          <td>{log.statusCode}</td>
                          <td>{formatDate(log.createdAt)}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="6" className="empty-text">
                        에러 로그가 없습니다.
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
  );
}

export default App;