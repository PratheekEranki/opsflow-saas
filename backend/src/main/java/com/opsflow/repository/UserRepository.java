package com.opsflow.repository;

import com.opsflow.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByOrganizationIdAndEmail(UUID orgId, String email);
    Optional<User> findByEmail(String email);
    boolean existsByOrganizationIdAndEmail(UUID orgId, String email);
    List<User> findByOrganizationIdAndActiveTrue(UUID orgId);

    @Query("SELECT u FROM User u WHERE u.organization.id = :orgId AND u.active = true AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<User> searchByOrg(UUID orgId, String q, Pageable pageable);
}
