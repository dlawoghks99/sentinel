package com.sentinel.backend.log.dto.response;

import com.sentinel.backend.log.entity.LogEvent;
import java.time.LocalDateTime;


public record LogEventResponse(Long id, String level, String message, int responseTimeMs, String serviceName, int statusCode, LocalDateTime createdAt)  {

    public static LogEventResponse from(LogEvent logEvent) {
        return new LogEventResponse(
                logEvent.getId(),
                logEvent.getLevel(),
                logEvent.getMessage(),
                logEvent.getResponseTimeMs(),
                logEvent.getServiceName(),
                logEvent.getStatusCode(),
                logEvent.getCreatedAt()
        );
    }
}
