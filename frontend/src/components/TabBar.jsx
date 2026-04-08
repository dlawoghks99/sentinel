const TABS = [
    { key: "all", label: "전체 로그" },
    { key: "error", label: "에러 로그" },
    { key: "slow", label: "느린 로그" },
];

function TabBar({ activeTab, onTabChange }) {
    return (
        <div className="tab-bar">
            {TABS.map((tab) => (
                <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => onTabChange(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export default TabBar;