package com.sentinel.backend.log.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.backend.log.dto.request.LogCreateRequest;
import com.sentinel.backend.log.repository.LogEventRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class LogEventConsumer {

    private final LogEventRepository repository;
    private final ObjectMapper objectMapper;

    public LogEventConsumer(LogEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = "log-events",
            groupId = "sentinel-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(String message) {
        try {
            LogCreateRequest request = objectMapper.readValue(message, LogCreateRequest.class);
            repository.save(request.toEntity());
        } catch (Exception e) {
            throw new RuntimeException("Kafka 메시지 처리 실패", e);
        }
    }
}
