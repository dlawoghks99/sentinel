package com.sentinel.backend.log.repository;

import com.sentinel.backend.log.entity.LogEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LogEventRepository extends JpaRepository<LogEvent, Long> {

    List<LogEvent> findByResponseTimeMsGreaterThan(int ms);

    List<LogEvent> findByLevel(String level);

    List<LogEvent> findByServiceName(String serviceName);

    List<LogEvent> findByLevelOrderByCreatedAtDesc(String level);
}