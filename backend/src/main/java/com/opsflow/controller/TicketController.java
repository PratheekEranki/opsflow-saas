package com.opsflow.controller;

import com.opsflow.dto.request.CreateTicketRequest;
import com.opsflow.dto.request.UpdateTicketStatusRequest;
import com.opsflow.dto.response.PageResponse;
import com.opsflow.dto.response.TicketResponse;
import com.opsflow.entity.Ticket;
import com.opsflow.service.TicketService;
import com.opsflow.util.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateTicketRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(orgId, projectId, request, userId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<TicketResponse>> getTickets(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(ticketService.getTickets(orgId, projectId, page, size, sort));
    }

    @GetMapping("/board")
    public ResponseEntity<Map<String, List<TicketResponse>>> getKanbanBoard(
            @PathVariable UUID projectId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Map<String, List<TicketResponse>> board = new LinkedHashMap<>();
        for (Ticket.Status status : Ticket.Status.values()) {
            board.put(status.name(), ticketService.getTicketsByStatus(orgId, projectId, status));
        }
        return ResponseEntity.ok(board);
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable UUID projectId,
            @PathVariable UUID ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ticketService.updateTicketStatus(orgId, projectId, ticketId, request, userId));
    }
}
