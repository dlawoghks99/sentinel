package com.sentinel.backend.log.dto.response;

public record LogStatsResponse(long totalCount, long errorCount, double avgResponseTimeMs) {
}
