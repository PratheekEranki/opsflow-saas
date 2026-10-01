package com.opsflow.controller;

import com.opsflow.entity.Project;
import com.opsflow.security.jwt.JwtUtils;
import com.opsflow.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import javax.validation.constraints.NotBlank;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<Page<Project>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        UUID orgId = getOrgId(request);
        return ResponseEntity.ok(projectService.listProjects(orgId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> get(@PathVariable UUID id, HttpServletRequest request) {
        UUID orgId = getOrgId(request);
        return ResponseEntity.ok(projectService.getProject(orgId, id));
    }

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody CreateProjectRequest req, HttpServletRequest request) {
        UUID orgId = getOrgId(request);
        UUID userId = getUserId(request);
        Project p = projectService.createProject(orgId, userId, req.getName(), req.getKey(), req.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(p);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable UUID id,
                                           @RequestBody UpdateProjectRequest req,
                                           HttpServletRequest request) {
        UUID orgId = getOrgId(request);
        Project.Status status = req.getStatus() != null ? Project.Status.valueOf(req.getStatus()) : null;
        return ResponseEntity.ok(projectService.updateProject(orgId, id, req.getName(), req.getDescription(), status));
    }

    private UUID getOrgId(HttpServletRequest req) {
        String token = req.getHeader("Authorization").substring(7);
        return jwtUtils.getOrgIdFromToken(token);
    }

    private UUID getUserId(HttpServletRequest req) {
        String token = req.getHeader("Authorization").substring(7);
        return jwtUtils.getUserIdFromToken(token);
    }

    @lombok.Data
    static class CreateProjectRequest {
        @NotBlank String name;
        @NotBlank String key;
        String description;
    }
    @lombok.Data
    static class UpdateProjectRequest {
        String name;
        String description;
        String status;
    }
}
