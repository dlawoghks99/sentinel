function Sparkline({ data, color }) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 50;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div style={{ marginTop: "12px", width: "100%", height: "50px" }}>
            <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none"
                 style={{ width: "100%", height: "100%" }}>
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

function StatsGrid({ stats, hourlyStats }) {
    const totalData = hourlyStats.map(s => s.total);
    const errorData = hourlyStats.map(s => s.errorCount);
    const avgData = hourlyStats.map(s => s.avgResponseTime ?? s.total);
    const errorRateData = hourlyStats.map(s => s.errorCount);

    return (
        <section className="stats-grid">
            <div className="stat-card">
                <h3>총 로그 수</h3>
                <div className="stat-value">{stats.totalCount}</div>
                <div className="stat-desc">전체 수집 로그</div>
                <Sparkline data={totalData} color="#3b82f6" />
            </div>
            <div className="stat-card">
                <h3>에러 로그 수</h3>
                <div className="stat-value">{stats.errorCount}</div>
                <div className="stat-desc">ERROR 레벨 기준</div>
                <Sparkline data={errorData} color="#ef4444" />
            </div>
            <div className="stat-card">
                <h3>평균 응답시간</h3>
                <div className="stat-value">{stats.avgResponseTime} ms</div>
                <div className="stat-desc">전체 로그 평균</div>
                <Sparkline data={avgData} color="#f59e0b" />
            </div>
            <div className="stat-card">
                <h3>에러 비율</h3>
                <div className="stat-value">{stats.errorRate}%</div>
                <div className="stat-desc">errorCount / totalCount</div>
                <Sparkline data={errorRateData} color="#10b981" />
            </div>
        </section>
    );
}

export default StatsGrid;