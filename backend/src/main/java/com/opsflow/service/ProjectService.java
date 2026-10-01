package com.opsflow.service;

import com.opsflow.entity.Organization;
import com.opsflow.entity.Project;
import com.opsflow.entity.User;
import com.opsflow.exception.ConflictException;
import com.opsflow.exception.ResourceNotFoundException;
import com.opsflow.repository.OrganizationRepository;
import com.opsflow.repository.ProjectRepository;
import com.opsflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<Project> listProjects(UUID orgId, int page, int size) {
        return projectRepository.findByOrganizationId(orgId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @Transactional(readOnly = true)
    public Project getProject(UUID orgId, UUID projectId) {
        return projectRepository.findByOrganizationIdAndId(orgId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    @Transactional
    public Project createProject(UUID orgId, UUID userId, String name, String key, String description) {
        if (projectRepository.existsByOrganizationIdAndKey(orgId, key.toUpperCase())) {
            throw new ConflictException("Project key already exists: " + key);
        }
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = Project.builder()
                .organization(org)
                .owner(owner)
                .name(name)
                .key(key.toUpperCase())
                .description(description)
                .status(Project.Status.ACTIVE)
                .build();

        Project saved = projectRepository.save(project);
        log.info("[PROJECT] Created: id={}, key={}, name={}, org={}", saved.getId(), saved.getKey(), saved.getName(), orgId);
        return saved;
    }

    @Transactional
    public Project updateProject(UUID orgId, UUID projectId, String name, String description, Project.Status status) {
        Project project = getProject(orgId, projectId);
        if (name != null) project.setName(name);
        if (description != null) project.setDescription(description);
        if (status != null) project.setStatus(status);
        return projectRepository.save(project);
    }
}
