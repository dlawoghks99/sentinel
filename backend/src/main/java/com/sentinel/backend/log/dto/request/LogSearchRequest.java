package com.sentinel.backend.log.dto.request;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

public record LogSearchRequest(String serviceName,
                               String keyword,

                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                               LocalDateTime startDate,

                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                               LocalDateTime endDate) {
}
