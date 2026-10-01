package com.opsflow.dto.request;

import com.opsflow.entity.Ticket;
import lombok.Data;
import javax.validation.constraints.NotNull;

@Data
public class UpdateTicketStatusRequest {
    @NotNull
    private Ticket.Status status;
    private Integer position;
}
