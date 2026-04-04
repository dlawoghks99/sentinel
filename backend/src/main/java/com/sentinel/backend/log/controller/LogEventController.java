package com.sentinel.backend.log.controller;

import com.sentinel.backend.log.entity.LogEvent;
import com.sentinel.backend.log.dto.LogEventResponse;
import com.sentinel.backend.log.dto.LogStatsResponse;
import com.sentinel.backend.log.service.LogEventService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

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
    public List<LogEventResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/slow")
    public List<LogEventResponse> getSlowLogs(@RequestParam int ms) {
        return service.getSlowLogs(ms);
    }

    @GetMapping("/error")
    public List<LogEventResponse> getErrorLogs(
            @RequestParam(value = "serviceName", required = false) String serviceName,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate
    ) {
        System.out.println("serviceName = " + serviceName);
        System.out.println("keyword = " + keyword);
        System.out.println("startDate = " + startDate);
        System.out.println("endDate = " + endDate);

        return service.getErrorLogs(serviceName, keyword, startDate, endDate);
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