function StatsGrid({ stats }) {
    return (
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
    );
}

export default StatsGrid;