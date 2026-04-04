package com.sentinel.backend.log.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
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