package com.opsflow.dto.request;

import com.opsflow.entity.Ticket;
import lombok.Data;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateTicketRequest {
    @NotBlank @Size(max = 500)
    private String title;

    private String description;

    @NotNull
    private Ticket.Priority priority;

    @NotNull
    private Ticket.Type type;

    private UUID assigneeId;
    private LocalDate dueDate;
    private BigDecimal estimatedHours;
}
