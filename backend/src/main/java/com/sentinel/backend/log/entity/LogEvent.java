package com.sentinel.backend.log.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(indexes = {
        @Index(name = "idx_log_service_name", columnList = "service_name"),
        @Index(name = "idx_log_level", columnList = "level"),
        @Index(name = "idx_log_created_at", columnList = "created_at"),
        @Index(name = "idx_log_response_time_ms", columnList = "response_time_ms")
})
public class LogEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private String level;
    private String message;
    private Integer responseTimeMs;
    private Integer statusCode;
    private LocalDateTime createdAt;
}