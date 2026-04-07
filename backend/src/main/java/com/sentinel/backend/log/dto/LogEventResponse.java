package com.sentinel.backend.log.dto;

import com.sentinel.backend.log.entity.LogEvent;
import java.time.LocalDateTime;


public class LogEventResponse  {
    private Long id;
    private String level;
    private String message;
    private int responseTimeMs;
    private String serviceName;
    private int statusCode;
    private LocalDateTime createdAt;

    public LogEventResponse(Long id, String level, String message, int responseTimeMs,
                            String serviceName, int statusCode, LocalDateTime createdAt) {
        this.id = id;
        this.level = level;
        this.message = message;
        this.responseTimeMs = responseTimeMs;
        this.serviceName = serviceName;
        this.statusCode = statusCode;
        this.createdAt = createdAt;
    }

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

    public Long getId() {
        return id;
    }

    public String getLevel() {
        return level;
    }

    public String getMessage() {
        return message;
    }

    public int getResponseTimeMs() {
        return responseTimeMs;
    }

    public String getServiceName() {
        return serviceName;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
