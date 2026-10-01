package com.opsflow.service;

import com.opsflow.dto.request.CreateTicketRequest;
import com.opsflow.dto.request.UpdateTicketStatusRequest;
import com.opsflow.dto.response.PageResponse;
import com.opsflow.dto.response.TicketResponse;
import com.opsflow.entity.Project;
import com.opsflow.entity.Ticket;
import com.opsflow.entity.User;
import com.opsflow.exception.ResourceNotFoundException;
import com.opsflow.kafka.producer.AuditEventProducer;
import com.opsflow.repository.ProjectRepository;
import com.opsflow.repository.TicketRepository;
import com.opsflow.repository.UserRepository;
import com.opsflow.websocket.TicketWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditEventProducer auditEventProducer;
    private final TicketWebSocketService wsService;
    private final NotificationService notificationService;

    @Transactional
    public TicketResponse createTicket(UUID orgId, UUID projectId, CreateTicketRequest req, UUID reporterId) {
        Project project = projectRepository.findByOrganizationIdAndId(orgId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User assignee = null;
        if (req.getAssigneeId() != null) {
            assignee = userRepository.findById(req.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
        }

        int ticketNumber = ticketRepository.getNextTicketNumber(projectId);

        Ticket ticket = Ticket.builder()
                .organization(project.getOrganization())
                .project(project)
                .ticketNumber(ticketNumber)
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(req.getPriority())
                .type(req.getType())
                .status(Ticket.Status.TODO)
                .assignee(assignee)
                .reporter(reporter)
                .dueDate(req.getDueDate())
                .estimatedHours(req.getEstimatedHours())
                .position(0)
                .build();

        ticket = ticketRepository.save(ticket);

        try {
            auditEventProducer.publish("TICKET_CREATED", "TICKET", ticket.getId(),
                    null, ticket, reporterId, null);
        } catch (Exception e) {
            log.warn("Kafka unavailable, skipping TICKET_CREATED audit: {}", e.getMessage());
        }

        if (assignee != null) {
            notificationService.sendNotification(assignee, "TICKET_ASSIGNED",
                    "Ticket assigned to you",
                    String.format("You've been assigned to [%s-%d] %s",
                            project.getKey(), ticketNumber, ticket.getTitle()),
                    "TICKET", ticket.getId());
        }

        TicketResponse response = toResponse(ticket, project);
        wsService.broadcastTicketUpdate(orgId, projectId, "CREATED", response);
        return response;
    }

    @Transactional
    @CacheEvict(value = "tickets", key = "#projectId")
    public TicketResponse updateTicketStatus(UUID orgId, UUID projectId, UUID ticketId,
                                              UpdateTicketStatusRequest req, UUID actorId) {
        Ticket ticket = ticketRepository.findByProjectIdAndId(projectId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Ticket.Status oldStatus = ticket.getStatus();
        ticket.setStatus(req.getStatus());
        if (req.getPosition() != null) ticket.setPosition(req.getPosition());

        ticket = ticketRepository.save(ticket);

        try {
            auditEventProducer.publish("TICKET_STATUS_CHANGED", "TICKET", ticketId,
                    Map.of("status", oldStatus.name()), Map.of("status", req.getStatus().name()),
                    actorId, null);
        } catch (Exception e) {
            log.warn("Kafka unavailable, skipping TICKET_STATUS_CHANGED audit: {}", e.getMessage());
        }

        TicketResponse response = toResponse(ticket, ticket.getProject());
        wsService.broadcastTicketUpdate(orgId, projectId, "STATUS_CHANGED", response);
        return response;
    }

    @Cacheable(value = "tickets", key = "#projectId + '_' + #status")
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByStatus(UUID orgId, UUID projectId, Ticket.Status status) {
        projectRepository.findByOrganizationIdAndId(orgId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return ticketRepository.findByProjectIdAndStatusOrderByPositionAsc(projectId, status)
                .stream().map(t -> toResponse(t, t.getProject())).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> getTickets(UUID orgId, UUID projectId, int page, int size, String sort) {
        projectRepository.findByOrganizationIdAndId(orgId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort.split(",")[0]).descending());
        Page<Ticket> ticketPage = ticketRepository.findByProjectId(projectId, pageable);
        return PageResponse.of(ticketPage.map(t -> toResponse(t, t.getProject())));
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> searchTickets(UUID orgId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ticket> ticketPage = ticketRepository.searchByOrg(orgId, query, pageable);
        return PageResponse.of(ticketPage.map(t -> toResponse(t, t.getProject())));
    }

    private TicketResponse toResponse(Ticket t, Project project) {
        return TicketResponse.builder()
                .id(t.getId())
                .ticketKey(project.getKey() + "-" + t.getTicketNumber())
                .ticketNumber(t.getTicketNumber())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .type(t.getType())
                .assignee(t.getAssignee() != null ? userSummary(t.getAssignee()) : null)
                .reporter(userSummary(t.getReporter()))
                .dueDate(t.getDueDate())
                .estimatedHours(t.getEstimatedHours())
                .position(t.getPosition())
                .projectId(project.getId())
                .projectName(project.getName())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private TicketResponse.UserSummary userSummary(User u) {
        return TicketResponse.UserSummary.builder()
                .id(u.getId()).fullName(u.getFullName())
                .email(u.getEmail()).avatarUrl(u.getAvatarUrl()).build();
    }
}
