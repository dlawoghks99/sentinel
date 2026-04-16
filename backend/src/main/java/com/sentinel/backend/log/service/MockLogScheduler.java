package com.sentinel.backend.log.service;

import com.sentinel.backend.log.dto.request.LogCreateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class MockLogScheduler {

    private final LogEventService logEventService;
    private final Random random = new Random();

    private static final List<String> SERVICE_NAMES = List.of(
            "user-service", "order-service", "payment-service", "product-service"
    );

    private static final List<String> LEVELS = List.of(
            "INFO", "INFO", "INFO", "WARN", "ERROR"  // INFO 비중 높게
    );

    private static final List<String> MESSAGES = List.of(
            "Request processed successfully",
            "User login attempt",
            "Order created",
            "Payment failed",
            "Slow database query detected",
            "Connection timeout",
            "NullPointerException occurred",
            "Cache miss"
    );

    @Scheduled(fixedRate = 3000)  // 3초마다 실행
    public void generateMockLog() {
        String level = LEVELS.get(random.nextInt(LEVELS.size()));
        int responseTimeMs = switch (level) {
            case "ERROR" -> 3000 + random.nextInt(2000);   // 3000~5000ms
            case "WARN"  -> 1500 + random.nextInt(1500);   // 1500~3000ms
            default      -> 50   + random.nextInt(450);    // 50~500ms
        };
        int statusCode = switch (level) {
            case "ERROR" -> random.nextBoolean() ? 500 : 503;
            case "WARN"  -> 429;
            default      -> 200;
        };

        LogCreateRequest request = new LogCreateRequest(
                SERVICE_NAMES.get(random.nextInt(SERVICE_NAMES.size())),
                level,
                MESSAGES.get(random.nextInt(MESSAGES.size())),
                responseTimeMs,
                statusCode
        );

        logEventService.create(request);
        log.info("[MockScheduler] 로그 생성: {} {} {}ms", level, request.serviceName(), responseTimeMs);
    }
}