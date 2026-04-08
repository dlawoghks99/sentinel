package com.sentinel.backend.log.service;

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

    public Page<LogEventResponse> findAll(Pageable pageable) {
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

    public LogStatsResponse getStats() {
        return new LogStatsResponse(
                repository.count(),
                repository.countErrors(),
                repository.avgResponseTime()
        );
    }

}
