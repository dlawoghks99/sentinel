package com.sentinel.backend.log.service;

import com.sentinel.backend.log.dto.response.LogHourlyStatsResponse;
import java.time.LocalDateTime;
import java.util.List;

import com.sentinel.backend.log.dto.request.LogCreateRequest;
import com.sentinel.backend.log.dto.request.LogSearchRequest;

import com.sentinel.backend.log.repository.LogEventRepository;
import com.sentinel.backend.log.dto.response.LogEventResponse;
import com.sentinel.backend.log.dto.response.LogStatsResponse;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class LogEventService {
    private final LogEventRepository repository;

    public LogEventService(LogEventRepository repository) {
        this.repository = repository;
    }

    // 느린 요청 조회
    public Page<LogEventResponse> getSlowLogs(int threshold, Pageable pageable) {
        return repository.findByResponseTimeMsGreaterThan(threshold, pageable)
                .map(LogEventResponse::from);
    }

    public LogEventResponse create(LogCreateRequest request) {
        return LogEventResponse.from(repository.save(request.toEntity()));
    }

    public Page<LogEventResponse> findAll(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        if (startDate != null || endDate != null) {
            return repository.findByCreatedAtBetween(startDate, endDate, pageable)
                    .map(LogEventResponse::from);
        }

        return repository.findAll(pageable).map(LogEventResponse::from);
    }

    public Page<LogEventResponse> getErrorLogs(LogSearchRequest req, Pageable pageable) {
        return repository.findErrorLogs(
                req.serviceName(), req.keyword(),
                req.startDate(), req.endDate(),
                pageable
        ).map(LogEventResponse::from);
    }

    public Page<LogEventResponse> getLogsByService(String serviceName,Pageable pageable) {
        return repository.findByServiceName(serviceName, pageable)
                .map(LogEventResponse::from);
    }

    public LogStatsResponse getStats(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return new LogStatsResponse(
                    repository.countByCreatedAtBetween(startDate, endDate),
                    repository.countErrorsByCreatedAtBetween(startDate, endDate),
                    repository.avgResponseTimeByCreatedAtBetween(startDate, endDate)
            );
        }
        return new LogStatsResponse(
                repository.count(),
                repository.countErrors(),
                repository.avgResponseTime()
        );
    }

    public List<LogHourlyStatsResponse> getHourlyStats() {
        LocalDateTime from = LocalDateTime.now().minusHours(24);
        return repository.findHourlyStats(from).stream()
                .map(row -> new LogHourlyStatsResponse(
                        row[0].toString().substring(11, 16),
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue()
                ))
                .toList();
    }

}
