function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                다음
            </button>
        </div>
    );
}

export default Pagination;