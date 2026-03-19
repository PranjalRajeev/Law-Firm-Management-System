package com.lawfirm.repository;

import com.lawfirm.entity.CaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRequestRepository extends JpaRepository<CaseRequest, Long> {

    /** All requests raised by a specific client — newest first */
    List<CaseRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);

    /** All PENDING requests — shown to all lawyers in their portal */
    List<CaseRequest> findByStatusOrderByCreatedAtDesc(CaseRequest.RequestStatus status);

    /** All requests accepted or rejected by a specific lawyer */
    List<CaseRequest> findByLawyerIdOrderByUpdatedAtDesc(Long lawyerId);

    /** Count pending requests for a client */
    long countByClientIdAndStatus(Long clientId, CaseRequest.RequestStatus status);

    /** Pending requests filtered by case type (for lawyer to find matches) */
    @Query("""
        SELECT r FROM CaseRequest r
        WHERE r.status = 'PENDING'
          AND (:caseType IS NULL OR r.caseType = :caseType)
        ORDER BY r.urgency DESC, r.createdAt ASC
    """)
    List<CaseRequest> findPendingByOptionalCaseType(
            @Param("caseType") com.lawfirm.entity.Case.CaseType caseType);
}