import { useState, useEffect } from "react";

function Header({ onRefresh }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatUTC = (date) => {
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(date.getUTCDate()).padStart(2, "0");
        const hh = String(date.getUTCHours()).padStart(2, "0");
        const mi = String(date.getUTCMinutes()).padStart(2, "0");
        const ss = String(date.getUTCSeconds()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} `;
    };

    return (
        <header className="header">
            <div className="header-top">
                <div>
                    <h1>Sentinel 대시보드</h1>
                    <p>로그 조회와 서비스 상태를 한눈에 보는 모니터링 화면</p>
                </div>
                <div className="header-right">
                    <div className="current-time">{formatUTC(now)}</div>
                    <button className="refresh-button" onClick={onRefresh}>
                        새로고침
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;