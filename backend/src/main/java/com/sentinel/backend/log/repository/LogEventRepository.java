package com.sentinel.backend.log.repository;

import com.sentinel.backend.log.entity.LogEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LogEventRepository extends JpaRepository<LogEvent, Long>, JpaSpecificationExecutor<LogEvent> {

    Page<LogEvent> findByResponseTimeMsGreaterThan(int ms, Pageable pageable);

    Page<LogEvent> findByServiceName(String serviceName, Pageable pageable);

    @Query("SELECT l FROM LogEvent l WHERE l.level = 'ERROR' " +
            "AND (:serviceName IS NULL OR l.serviceName LIKE %:serviceName%) " +
            "AND (:keyword IS NULL OR l.message LIKE %:keyword%) " +
            "AND (CAST(:startDate AS java.time.LocalDateTime) IS NULL OR l.createdAt >= :startDate) " +
            "AND (CAST(:endDate AS java.time.LocalDateTime) IS NULL OR l.createdAt <= :endDate) " +
            "ORDER BY l.createdAt DESC")
    Page<LogEvent> findErrorLogs(
            @Param("serviceName") String serviceName,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(l) FROM LogEvent l WHERE l.level = 'ERROR'")
    long countErrors();

    @Query("SELECT COALESCE(AVG(l.responseTimeMs), 0) FROM LogEvent l")
    double avgResponseTime();

    @Query("SELECT FUNCTION('date_trunc', 'hour', l.createdAt) as hour, " +
            "COUNT(l) as total, " +
            "SUM(CASE WHEN l.level = 'ERROR' THEN 1 ELSE 0 END) as errorCount " +
            "FROM LogEvent l " +
            "WHERE l.createdAt >= :from " +
            "GROUP BY FUNCTION('date_trunc', 'hour', l.createdAt) " +
            "ORDER BY FUNCTION('date_trunc', 'hour', l.createdAt) ASC")
    List<Object[]> findHourlyStats(@Param("from") LocalDateTime from);

    int deleteByCreatedAtBefore(LocalDateTime cutoff);

    Page<LogEvent> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("SELECT COUNT(l) FROM LogEvent l WHERE l.createdAt BETWEEN :startDate AND :endDate")
    long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(l) FROM LogEvent l WHERE l.level = 'ERROR' AND l.createdAt BETWEEN :startDate AND :endDate")
    long countErrorsByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(AVG(l.responseTimeMs), 0) FROM LogEvent l WHERE l.createdAt BETWEEN :startDate AND :endDate")
    double avgResponseTimeByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 1. 레벨별 집계
    @Query("SELECT l.level, COUNT(l) FROM LogEvent l " +
            "WHERE (CAST(:startDate AS java.time.LocalDateTime) IS NULL OR l.createdAt >= :startDate) " +
            "  AND (CAST(:endDate AS java.time.LocalDateTime) IS NULL OR l.createdAt <= :endDate) " +
            "GROUP BY l.level")
    List<Object[]> countGroupByLevel(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // 2. 서비스별 집계 (개수 많은 순으로 정렬)
    @Query("SELECT l.serviceName, COUNT(l) FROM LogEvent l " +
            "WHERE (CAST(:startDate AS java.time.LocalDateTime) IS NULL OR l.createdAt >= :startDate) " +
            "  AND (CAST(:endDate AS java.time.LocalDateTime) IS NULL OR l.createdAt <= :endDate) " +
            "  AND l.serviceName IS NOT NULL " +
            "GROUP BY l.serviceName " +
            "ORDER BY COUNT(l) DESC")
    List<Object[]> countGroupByService(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // 3. 응답시간 분포 (fast/normal/slow)
    @Query("SELECT " +
            "  SUM(CASE WHEN l.responseTimeMs <= 200 THEN 1L ELSE 0L END), " +
            "  SUM(CASE WHEN l.responseTimeMs > 200 AND l.responseTimeMs <= 1000 THEN 1L ELSE 0L END), " +
            "  SUM(CASE WHEN l.responseTimeMs > 1000 THEN 1L ELSE 0L END) " +
            "FROM LogEvent l " +
            "WHERE (CAST(:startDate AS java.time.LocalDateTime) IS NULL OR l.createdAt >= :startDate) " +
            "  AND (CAST(:endDate AS java.time.LocalDateTime) IS NULL OR l.createdAt <= :endDate)")
    List<Object[]> countResponseTimeBuckets(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}