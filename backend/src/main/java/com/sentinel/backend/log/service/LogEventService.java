package com.sentinel.backend.log.service;

import com.sentinel.backend.log.entity.LogEvent;
import com.sentinel.backend.log.repository.LogEventRepository;
import com.sentinel.backend.log.dto.LogEventResponse;
import com.sentinel.backend.log.dto.LogStatsResponse;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogEventService {
    private final LogEventRepository repository;

    public LogEventService(LogEventRepository repository) {
        this.repository = repository;
    }

    // 느린 요청 조회
    public List<LogEventResponse> getSlowLogs(int threshold) {
        return repository.findByResponseTimeMsGreaterThan(threshold).stream()
                .map(LogEventResponse::from)
                .toList();
    }

    public LogEvent create(LogEvent logEvent) {
        logEvent.setCreatedAt(LocalDateTime.now());
        return repository.save(logEvent);
    }

    public List<LogEventResponse> findAll() {
        return repository.findAll().stream()
                .map(LogEventResponse::from)
                .toList();
    }

    public List<LogEventResponse> getErrorLogs(
            String serviceName,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        return repository.findByLevelOrderByCreatedAtDesc("ERROR")
                .stream()
                .filter(log -> serviceName == null || log.getServiceName().contains(serviceName))
                .filter(log -> keyword == null || log.getMessage().contains(keyword))
                .filter(log -> startDate == null || !log.getCreatedAt().isBefore(startDate))
                .filter(log -> endDate == null || !log.getCreatedAt().isAfter(endDate))
                .map(LogEventResponse::from)
                .toList();
    }

    public List<LogEventResponse> getLogsByService(String serviceName) {
        return repository.findByServiceName(serviceName).stream()
                .map(LogEventResponse::from)
                .toList();
    }

    public LogStatsResponse getStats() {
        List<LogEvent> logs = repository.findAll();

        long totalCount = logs.size();

        long errorCount = logs.stream()
                .filter(log -> "ERROR".equals(log.getLevel()))
                .count();

        double avgResponseTimeMs = logs.stream()
                .mapToInt(LogEvent::getResponseTimeMs)
                .average()
                .orElse(0.0);

        return new LogStatsResponse(totalCount, errorCount, avgResponseTimeMs);
    }
}
