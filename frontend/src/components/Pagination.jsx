function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // 표시할 페이지 번호 계산
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // 현재 페이지 주변에 보여줄 개수

        if (totalPages <= 7) {
            // 페이지가 적으면 전부 표시
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        // 항상 첫 페이지
        pages.push(1);

        // 현재 페이지 주변 범위 계산
        let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages - 1, start + maxVisible - 1);

        // 끝에 가까우면 시작점 조정
        if (end - start < maxVisible - 1) {
            start = Math.max(2, end - maxVisible + 1);
        }

        // 앞 생략 표시
        if (start > 2) pages.push("...");

        // 중간 페이지들
        for (let i = start; i <= end; i++) pages.push(i);

        // 뒤 생략 표시
        if (end < totalPages - 1) pages.push("...");

        // 항상 마지막 페이지
        pages.push(totalPages);

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="pagination">
            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                이전
            </button>
            {pageNumbers.map((page, idx) => (
                page === "..." ? (
                    <span key={`dots-${idx}`} className="page-btn" style={{ cursor: "default" }}>
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        className={`page-btn ${currentPage === page ? "active" : ""}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
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