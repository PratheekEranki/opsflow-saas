package com.opsflow.repository;

import com.opsflow.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Page<Ticket> findByProjectId(UUID projectId, Pageable pageable);
    List<Ticket> findByProjectIdAndStatusOrderByPositionAsc(UUID projectId, Ticket.Status status);
    Optional<Ticket> findByProjectIdAndId(UUID projectId, UUID id);
    boolean existsByProjectIdAndTicketNumber(UUID projectId, Integer number);

    @Query("SELECT COALESCE(MAX(t.ticketNumber), 0) + 1 FROM Ticket t WHERE t.project.id = :projectId")
    Integer getNextTicketNumber(UUID projectId);

    @Query("SELECT t FROM Ticket t WHERE t.organization.id = :orgId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Ticket> searchByOrg(UUID orgId, String q, Pageable pageable);

    Page<Ticket> findByOrganizationIdAndAssigneeId(UUID orgId, UUID assigneeId, Pageable pageable);
}
