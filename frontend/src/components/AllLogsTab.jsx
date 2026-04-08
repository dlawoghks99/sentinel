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

function AllLogsTab({
                        logs, loading,
                        totalCount,
                        keyword, setKeyword,
                        serviceFilter, setServiceFilter,
                        currentPage, totalPages, onPageChange,
                    }) {
    return (
        <>
            <div className="filter-row">
                <input className="input" type="text" placeholder="메시지 / 레벨 검색"
                       value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <input className="input" type="text" placeholder="서비스명 필터"
                       value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} />
            </div>
            <div className="table-top">
        <span className="table-count">
          {loading ? "불러오는 중..." : `총 ${totalCount}건`}
        </span>
            </div>
            <LogTable logs={logs} columns={COLUMNS} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </>
    );
}

export default AllLogsTab;