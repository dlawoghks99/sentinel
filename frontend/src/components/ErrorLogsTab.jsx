import LogTable from "./LogTable";
import Pagination from "./Pagination";

const COLUMNS = [
    { key: "id", label: "ID" },
    { key: "level", label: "레벨" },
    { key: "message", label: "메시지" },
    { key: "serviceName", label: "서비스명" },
    { key: "statusCode", label: "상태코드" },
    { key: "createdAt", label: "생성시각" },
];

function ErrorLogsTab({
                          logs,
                          totalCount,
                          serviceName, setServiceName,
                          keyword, setKeyword,
                          startDate, setStartDate,
                          endDate, setEndDate,
                          currentPage, totalPages, onPageChange,
                      }) {
    return (
        <>
            <div className="filter-row">
                <input className="input" type="text" placeholder="서비스명"
                       value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
                <input className="input" type="text" placeholder="키워드"
                       value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <input className="input date-input" type="datetime-local"
                       value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input className="input date-input" type="datetime-local"
                       value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="table-top">
                <span className="table-count">총 {totalCount}건</span>
            </div>
            <LogTable logs={logs} columns={COLUMNS} emptyText="에러 로그가 없습니다." />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </>
    );
}

export default ErrorLogsTab;