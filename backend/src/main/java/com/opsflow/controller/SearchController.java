package com.opsflow.controller;

import com.opsflow.dto.response.*;
import com.opsflow.service.TicketService;
import com.opsflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final TicketService ticketService;

    @GetMapping("/tickets")
    public ResponseEntity<PageResponse<TicketResponse>> searchTickets(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(ticketService.searchTickets(orgId, q, page, size));
    }
}
