import { formatDate } from "../utils/formatDate";

function LogTable({ logs, columns, emptyText = "조회된 로그가 없습니다." }) {
    return (
        <div className="table-wrapper">
            <table>
                <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {logs.length > 0 ? (
                    logs.map((log) => (
                        <tr key={log.id}>
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.key === "level" ? (
                                        <span className={`level-badge ${log.level === "ERROR" ? "error" : ""}`}>
                        {log.level}
                      </span>
                                    ) : col.key === "createdAt" ? (
                                        formatDate(log.createdAt)
                                    ) : col.key === "responseTimeMs" ? (
                                        `${log[col.key]} ms`
                                    ) : (
                                        log[col.key]
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length} className="empty-text">
                            {emptyText}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default LogTable;