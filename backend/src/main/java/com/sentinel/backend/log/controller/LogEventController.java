package com.sentinel.backend.log.controller;

import com.sentinel.backend.log.entity.LogEvent;
import com.sentinel.backend.log.dto.LogEventResponse;
import com.sentinel.backend.log.dto.LogStatsResponse;
import com.sentinel.backend.log.service.LogEventService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogEventController {

    private final LogEventService service;

    public LogEventController(LogEventService service) {
        this.service = service;
    }

    @PostMapping
    public LogEvent create(@RequestBody LogEvent logEvent) {
        return service.create(logEvent);
    }

    @GetMapping
    public Page<LogEventResponse> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.findAll(page, size);
    }

    @GetMapping("/slow")
    public List<LogEventResponse> getSlowLogs(@RequestParam int ms) {
        return service.getSlowLogs(ms);
    }

    @GetMapping("/error")
    public Page<LogEventResponse> getErrorLogs(
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getErrorLogs(serviceName, keyword, startDate, endDate, page, size);
    }

    @GetMapping("/service/{name}")
    public List<LogEventResponse> getLogsByService(@PathVariable String name) {
        return service.getLogsByService(name);
    }

    @GetMapping("/stats")
    public LogStatsResponse getStats() {
        return service.getStats();
    }
}