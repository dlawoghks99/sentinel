package com.sentinel.backend.log.dto;

public class LogStatsResponse {
    private long totalCount;
    private long errorCount;
    private double avgResponseTimeMs;

    public LogStatsResponse(long totalCount, long errorCount, double avgResponseTimeMs) {
        this.totalCount = totalCount;
        this.errorCount = errorCount;
        this.avgResponseTimeMs = avgResponseTimeMs;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public long getErrorCount() {
        return errorCount;
    }

    public double getAvgResponseTimeMs() {
        return avgResponseTimeMs;
    }
}
