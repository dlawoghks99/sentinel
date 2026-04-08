package com.sentinel.backend.log.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.backend.log.dto.request.LogCreateRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

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
            kafkaTemplate.send(TOPIC, message);
        } catch (Exception e) {
            throw new RuntimeException("Kafka 메시지 전송 실패", e);
        }
    }
}