package com.sentinel.backend.log.service;

import com.sentinel.backend.log.dto.response.LogHourlyStatsResponse;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.sentinel.backend.log.dto.request.LogCreateRequest;
import com.sentinel.backend.log.dto.request.LogSearchRequest;

import com.sentinel.backend.log.entity.LogEvent;
import com.sentinel.backend.log.repository.LogEventRepository;
import com.sentinel.backend.log.dto.response.LogEventResponse;
import com.sentinel.backend.log.dto.response.LogStatsResponse;
import org.springframework.stereotype.Service;

import com.sentinel.backend.log.repository.LogEventSpecifications;
import org.springframework.data.jpa.domain.Specification;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class LogEventService {
    private final LogEventRepository repository;

    public LogEventService(LogEventRepository repository) {
        this.repository = repository;
    }

    // 느린 요청 조회
    public Page<LogEventResponse> getSlowLogs(int ms, String serviceName, Pageable pageable) {
        Specification<LogEvent> spec = Specification
                .where(LogEventSpecifications.responseTimeGreaterThan(ms))
                .and(LogEventSpecifications.hasServiceName(serviceName));

        return repository.findAll(spec, pageable)
                .map(LogEventResponse::from);
    }

    public LogEventResponse create(LogCreateRequest request) {
        return LogEventResponse.from(repository.save(request.toEntity()));
    }

    public Page<LogEventResponse> findAll(
            String keyword,
            String serviceName,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        Specification<LogEvent> spec = Specification
                .where(LogEventSpecifications.hasKeyword(keyword))
                .and(LogEventSpecifications.hasServiceName(serviceName))
                .and(LogEventSpecifications.createdAfter(startDate))
                .and(LogEventSpecifications.createdBefore(endDate));

        return repository.findAll(spec, pageable)
                .map(LogEventResponse::from);
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

        // 기본 통계 3개 준비
        long total;
        long errors;
        double avgResponseTime;

        if (startDate != null && endDate != null) {
            total = repository.countByCreatedAtBetween(startDate, endDate);
            errors = repository.countErrorsByCreatedAtBetween(startDate, endDate);
            avgResponseTime = repository.avgResponseTimeByCreatedAtBetween(startDate, endDate);
        } else {
            total = repository.count();
            errors = repository.countErrors();
            avgResponseTime = repository.avgResponseTime();
        }

        // 레벨별 분포 집계
        List<Object[]> levelRows = repository.countGroupByLevel(startDate, endDate);

        long info = 0, warn = 0, error = 0;
        for (Object[] row : levelRows) {
            String level = (String) row[0];
            long count = ((Number) row[1]).longValue();

            switch (level) {
                case "INFO"  -> info = count;
                case "WARN"  -> warn = count;
                case "ERROR" -> error = count;
            }
        }

        // 서비스별 분포 집계
        LogStatsResponse.LevelDistribution levelDist =
                new LogStatsResponse.LevelDistribution(info, warn, error);

        List<Object[]> serviceRows = repository.countGroupByService(startDate, endDate);

        Map<String, Long> serviceDist = new LinkedHashMap<>();
        for (Object[] row : serviceRows) {
            String serviceName = (String) row[0];
            long count = ((Number) row[1]).longValue();
            serviceDist.put(serviceName, count);
        }

        // 응답시간 분포 집계
        List<Object[]> bucketRows = repository.countResponseTimeBuckets(startDate, endDate);
        long fast = 0L, normal = 0L, slow = 0L;

        if (!bucketRows.isEmpty()) {
            Object[] bucketRow = bucketRows.get(0);
            fast = bucketRow[0] != null ? ((Number) bucketRow[0]).longValue() : 0L;
            normal = bucketRow[1] != null ? ((Number) bucketRow[1]).longValue() : 0L;
            slow = bucketRow[2] != null ? ((Number) bucketRow[2]).longValue() : 0L;
        }

        LogStatsResponse.ResponseTimeBuckets responseTimeBuckets =
                new LogStatsResponse.ResponseTimeBuckets(fast, normal, slow);

        // 최종 응답
        return new LogStatsResponse(
                total,
                errors,
                avgResponseTime,
                levelDist,
                serviceDist,
                responseTimeBuckets
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
