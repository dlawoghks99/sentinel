package com.sentinel.backend.log.dto.request;

import com.sentinel.backend.log.entity.LogEvent;
import java.time.LocalDateTime;

public record LogCreateRequest(String serviceName,
                               String level,
                               String message,
                               Integer responseTimeMs,
                               Integer statusCode) {
    public LogEvent toEntity() {
        LogEvent e = new LogEvent();
        e.setServiceName(this.serviceName);
        e.setLevel(this.level);
        e.setMessage(this.message);
        e.setResponseTimeMs(this.responseTimeMs);
        e.setStatusCode(this.statusCode);
        e.setCreatedAt(LocalDateTime.now());
        return e;
    }
}
