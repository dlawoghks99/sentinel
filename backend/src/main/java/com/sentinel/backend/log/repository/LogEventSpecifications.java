package com.sentinel.backend.log.repository;

import com.sentinel.backend.log.entity.LogEvent;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class LogEventSpecifications {

    // 인스턴스 생성 방지 (유틸 클래스)
    private LogEventSpecifications() {}

    // 키워드 검색: message OR level
    public static Specification<LogEvent> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;  // 조건 없음
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            Predicate messageMatch = cb.like(cb.lower(root.get("message")), pattern);
            Predicate levelMatch = cb.like(cb.lower(root.get("level")), pattern);
            return cb.or(messageMatch, levelMatch);
        };
    }

    // 서비스명 부분 일치
    public static Specification<LogEvent> hasServiceName(String serviceName) {
        return (root, query, cb) -> {
            if (serviceName == null || serviceName.isBlank()) {
                return null;
            }
            String pattern = "%" + serviceName.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("serviceName")), pattern);
        };
    }

    // 시작일 이후
    public static Specification<LogEvent> createdAfter(LocalDateTime startDate) {
        return (root, query, cb) -> {
            if (startDate == null) {
                return null;
            }
            return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
        };
    }

    // 종료일 이전
    public static Specification<LogEvent> createdBefore(LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (endDate == null) {
                return null;
            }
            return cb.lessThanOrEqualTo(root.get("createdAt"), endDate);
        };
    }

    public static Specification<LogEvent> responseTimeGreaterThan(int ms) {
        return (root, query, cb) ->
                cb.greaterThan(root.get("responseTimeMs"), ms);
    }
}