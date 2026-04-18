package com.sentinel.backend.global.aop;

import com.sentinel.backend.log.dto.request.LogCreateRequest;
import com.sentinel.backend.log.service.LogEventService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LoggingAspect {

    private final LogEventService logEventService;

    @Around("execution(* com.sentinel.backend.log.controller..*(..))")
    public Object logApiRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes)
                RequestContextHolder.currentRequestAttributes()).getRequest();

        String method = request.getMethod();
        String uri = request.getRequestURI();
        long start = System.currentTimeMillis();

        Object result;
        String level = "INFO";
        int statusCode = 200;

        try {
            result = joinPoint.proceed();
        } catch (Exception e) {
            level = "ERROR";
            statusCode = 500;
            throw e;
        } finally {
            long responseTimeMs = System.currentTimeMillis() - start;

            // 느린 요청은 WARN으로
            if ("INFO".equals(level) && responseTimeMs > 2000) {
                level = "WARN";
            }

            LogCreateRequest logRequest = new LogCreateRequest(
                    "sentinel-api",
                    level,
                    method + " " + uri,
                    (int) responseTimeMs,
                    statusCode
            );

            logEventService.create(logRequest);
            log.info("[AOP] {} {} {}ms {}", method, uri, responseTimeMs, level);
        }

        return result;
    }
}