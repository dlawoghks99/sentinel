function Header({ onRefresh, onGenerateTestLogs }) {
    return (
        <header className="header">
            <h1>Sentinel 대시보드</h1>
            <p>로그 조회와 서비스 상태를 한눈에 보는 모니터링 화면</p>
            <button className="refresh-button" onClick={onRefresh}>
                새로고침
            </button>
            <button
                className="refresh-button"
                style={{ marginLeft: "10px", background: "var(--muted)" }}
                onClick={onGenerateTestLogs}
            >
                테스트 로그 생성
            </button>
        </header>
    );
}

export default Header;