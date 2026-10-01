package com.opsflow.dto.response;

import com.opsflow.entity.Ticket;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class TicketResponse {
    private UUID id;
    private String ticketKey;
    private Integer ticketNumber;
    private String title;
    private String description;
    private Ticket.Status status;
    private Ticket.Priority priority;
    private Ticket.Type type;
    private UserSummary assignee;
    private UserSummary reporter;
    private LocalDate dueDate;
    private BigDecimal estimatedHours;
    private Integer position;
    private UUID projectId;
    private String projectName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data @Builder
    public static class UserSummary {
        private UUID id;
        private String fullName;
        private String email;
        private String avatarUrl;
    }
}
