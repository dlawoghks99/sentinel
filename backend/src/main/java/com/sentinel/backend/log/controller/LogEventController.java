package com.sentinel.backend.log.controller;

import com.sentinel.backend.log.dto.request.LogCreateRequest;
import com.sentinel.backend.log.dto.request.LogSearchRequest;
import com.sentinel.backend.log.dto.response.LogEventResponse;
import com.sentinel.backend.log.dto.response.LogStatsResponse;
import com.sentinel.backend.log.service.LogEventService;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/logs")
public class LogEventController {

    private final LogEventService service;

    public LogEventController(LogEventService service) {
        this.service = service;
    }

    @PostMapping
    public LogEventResponse create(@RequestBody LogCreateRequest request) {
        return service.create(request);
    }

    @GetMapping
    public Page<LogEventResponse> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.findAll(page, size);
    }

    @GetMapping("/slow")
    public Page<LogEventResponse> getSlowLogs(
            @RequestParam int ms,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getSlowLogs(ms, page, size);
    }

    @GetMapping("/error")
    public Page<LogEventResponse> getErrorLogs(
            @ModelAttribute LogSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getErrorLogs(searchRequest, page, size);
    }

    @GetMapping("/service/{name}")
    public Page<LogEventResponse> getLogsByService(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getLogsByService(name, page, size);
    }

    @GetMapping("/stats")
    public LogStatsResponse getStats() {
        return service.getStats();
    }
}