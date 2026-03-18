package com.lawfirm.repository;

import com.lawfirm.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {
    List<Case> findByClient_Id(Long clientId);
    List<Case> findByAssignedLawyerId(Long lawyerId);
    List<Case> findByStatus(Case.CaseStatus status);
    List<Case> findByCaseType(Case.CaseType caseType);
    List<Case> findByClientId(Long clientId);
    
    @Query("SELECT c FROM Case c WHERE c.client.id = :clientId OR c.assignedLawyer.id = :lawyerId")
    List<Case> findCasesByClientOrLawyer(@Param("clientId") Long clientId, @Param("lawyerId") Long lawyerId);
    
    @Query("SELECT c FROM Case c WHERE c.title LIKE %:keyword% OR c.caseNumber LIKE %:keyword% OR c.description LIKE %:keyword%")
    List<Case> searchCases(@Param("keyword") String keyword);
    
    @Query("SELECT COUNT(c) FROM Case c WHERE c.status = :status")
    Long countByStatus(@Param("status") Case.CaseStatus status);
}
