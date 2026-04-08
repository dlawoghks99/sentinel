import LogTable from "./LogTable";
import Pagination from "./Pagination";

const COLUMNS = [
    { key: "id", label: "ID" },
    { key: "level", label: "레벨" },
    { key: "message", label: "메시지" },
    { key: "responseTimeMs", label: "응답시간" },
    { key: "serviceName", label: "서비스명" },
    { key: "statusCode", label: "상태코드" },
    { key: "createdAt", label: "생성시각" },
];

function SlowLogsTab({
                         logs,
                         totalCount,
                         threshold, setThreshold,
                         serviceFilter, setServiceFilter,
                         currentPage, totalPages, onPageChange,
                         onSearch,
                     }) {
    return (
        <>
            <div className="filter-row">
                <input className="input" type="number" placeholder="기준 응답시간 (ms)"
                       value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                <input className="input" type="text" placeholder="서비스명 필터"
                       value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} />
            </div>
            <div className="table-top">
                <span className="table-count">총 {totalCount}건</span>
                <button className="refresh-button" onClick={onSearch}>느린 로그 조회</button>
            </div>
            <LogTable logs={logs} columns={COLUMNS} emptyText="조회된 느린 로그가 없습니다." />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </>
    );
}

export default SlowLogsTab;