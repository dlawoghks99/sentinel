package com.sentinel.backend.log.repository;

import com.sentinel.backend.log.entity.LogEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LogEventRepository extends JpaRepository<LogEvent, Long> {

    Page<LogEvent> findByResponseTimeMsGreaterThan(int ms, Pageable pageable);

    List<LogEvent> findByLevel(String level);

    List<LogEvent> findByServiceName(String serviceName);

    List<LogEvent> findByLevelOrderByCreatedAtDesc(String level);

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
}