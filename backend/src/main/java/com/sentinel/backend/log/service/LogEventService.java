package com.sentinel.backend.log.service;

import com.sentinel.backend.log.entity.LogEvent;
import com.sentinel.backend.log.repository.LogEventRepository;
import com.sentinel.backend.log.dto.LogEventResponse;
import com.sentinel.backend.log.dto.LogStatsResponse;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;

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

    public Page<LogEventResponse> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return repository.findAll(pageable)
                .map(LogEventResponse::from);
    }

    public Page<LogEventResponse> getErrorLogs(
            String serviceName,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findErrorLogs(serviceName, keyword, startDate, endDate, pageable)
                .map(LogEventResponse::from);
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
