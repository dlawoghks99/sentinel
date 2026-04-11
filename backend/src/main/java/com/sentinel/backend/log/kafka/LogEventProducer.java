package com.sentinel.backend.log.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.backend.log.dto.request.LogCreateRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class LogEventProducer {

    private static final String TOPIC = "log-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public LogEventProducer(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void send(LogCreateRequest request) {
        try {
            String message = objectMapper.writeValueAsString(request);
            kafkaTemplate.send(TOPIC, message).whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Kafka 전송 실패: {}", ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("Kafka 메시지 직렬화 실패: {}", e.getMessage());
        }
    }
}