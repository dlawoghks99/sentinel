package com.sentinel.backend.log.controller;

import com.sentinel.backend.log.dto.request.LogCreateRequest;
import com.sentinel.backend.log.dto.request.LogSearchRequest;
import com.sentinel.backend.log.dto.response.LogEventResponse;
import com.sentinel.backend.log.dto.response.LogStatsResponse;
import com.sentinel.backend.log.service.LogEventService;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.sentinel.backend.log.kafka.LogEventProducer;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/logs")
public class LogEventController {

    private final LogEventService service;
    private final LogEventProducer producer;

    public LogEventController(LogEventService service, LogEventProducer producer) {
        this.service = service;
        this.producer = producer;
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody LogCreateRequest request) {
        producer.send(request);
        return ResponseEntity.ok("로그 전송 완료");
    }

    @GetMapping
    public Page<LogEventResponse> findAll(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return service.findAll(pageable);
    }

    @GetMapping("/slow")
    public Page<LogEventResponse> getSlowLogs(
            @RequestParam int ms,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return service.getSlowLogs(ms, pageable);
    }

    @GetMapping("/error")
    public Page<LogEventResponse> getErrorLogs(
            @ModelAttribute LogSearchRequest searchRequest,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return service.getErrorLogs(searchRequest, pageable);
    }

    @GetMapping("/service/{name}")
    public Page<LogEventResponse> getLogsByService(
            @PathVariable String name,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return service.getLogsByService(name, pageable);
    }

    @GetMapping("/stats")
    public LogStatsResponse getStats() {
        return service.getStats();
    }
}