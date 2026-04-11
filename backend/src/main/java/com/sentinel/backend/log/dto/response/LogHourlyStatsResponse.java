package com.sentinel.backend.log.dto.response;

public record LogHourlyStatsResponse(String hour, long total, long errorCount) {
}
