package com.lawfirm.repository;

import com.lawfirm.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {

    /** All cases by client User ID */
    @Query("SELECT c FROM Case c WHERE c.client.id = :clientId")
    List<Case> findByClientId(@Param("clientId") Long clientId);

    /** All cases for a logged-in client (Case.client is a User) */
    @Query("SELECT c FROM Case c WHERE c.client.username = :username ORDER BY c.createdAt DESC")
    List<Case> findByClientUsername(@Param("username") String username);

    /** Single case with ownership check */
    @Query("SELECT c FROM Case c WHERE c.id = :caseId AND c.client.username = :username")
    Optional<Case> findByIdAndClientUsername(@Param("caseId") Long caseId,
                                             @Param("username") String username);

    /** Count by status — used by admin dashboard stats */
    long countByStatus(Case.CaseStatus status);

    /** Cases assigned to a lawyer */
    @Query("SELECT c FROM Case c WHERE c.assignedLawyer.username = :username ORDER BY c.createdAt DESC")
    List<Case> findByAssignedLawyerUsername(@Param("username") String username);
}