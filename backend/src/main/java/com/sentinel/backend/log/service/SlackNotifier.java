package com.sentinel.backend.log.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class SlackNotifier {

    @Value("${slack.webhook.url}")
    private String webhookUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendAlert(String message) {
        try {
            restTemplate.postForObject(
                    webhookUrl,
                    Map.of("text", message),
                    String.class
            );
        } catch (Exception e) {
            log.error("[SlackNotifier] 슬랙 알림 전송 실패: {}", e.getMessage());
        }
    }
}