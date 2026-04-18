package com.sentinel.backend.log.service;

import com.sentinel.backend.log.repository.LogEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class LogCleanupScheduler {

    private final LogEventRepository logEventRepository;

    // 매일 새벽 3시에 실행
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupOldLogs() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7); // 7일 이상된 로그 삭제
        int deleted = logEventRepository.deleteByCreatedAtBefore(cutoff);
        log.info("[LogCleanup] 오래된 로그 삭제 완료: {}건 (기준: {})", deleted, cutoff);
    }

}