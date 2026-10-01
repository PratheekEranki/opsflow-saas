package com.opsflow.repository;

import com.opsflow.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Page<Project> findByOrganizationId(UUID orgId, Pageable pageable);
    Optional<Project> findByOrganizationIdAndId(UUID orgId, UUID id);
    boolean existsByOrganizationIdAndKey(UUID orgId, String key);
    List<Project> findByOrganizationIdAndStatus(UUID orgId, Project.Status status);
}
