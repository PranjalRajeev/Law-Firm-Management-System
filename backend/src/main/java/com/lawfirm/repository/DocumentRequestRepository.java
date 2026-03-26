package com.lawfirm.repository;

import com.lawfirm.entity.DocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    // ── Lawyer-scoped ─────────────────────────────────────────────────────────

    @Query("""
        SELECT r FROM DocumentRequest r
        JOIN FETCH r.caseEntity c
        LEFT JOIN FETCH r.requestedBy
        LEFT JOIN FETCH r.fulfilledDocument
        WHERE c.assignedLawyer.username = :username
        ORDER BY r.createdAt DESC
    """)
    List<DocumentRequest> findAllByLawyerUsername(@Param("username") String username);

    @Query("""
        SELECT r FROM DocumentRequest r
        JOIN FETCH r.caseEntity c
        LEFT JOIN FETCH r.requestedBy
        LEFT JOIN FETCH r.fulfilledDocument
        WHERE r.caseEntity.id = :caseId AND c.assignedLawyer.username = :username
        ORDER BY r.createdAt DESC
    """)
    List<DocumentRequest> findByCaseIdAndLawyerUsername(@Param("caseId") Long caseId,
                                                        @Param("username") String username);

    @Query("""
        SELECT r FROM DocumentRequest r
        WHERE r.id = :id AND r.caseEntity.assignedLawyer.username = :username
    """)
    Optional<DocumentRequest> findByIdAndLawyerUsername(@Param("id") Long id,
                                                        @Param("username") String username);

    @Query("""
        SELECT COUNT(r) FROM DocumentRequest r
        WHERE r.caseEntity.assignedLawyer.username = :username
          AND r.status = 'PENDING'
    """)
    long countPendingByLawyerUsername(@Param("username") String username);

    // ── Client-scoped ─────────────────────────────────────────────────────────

    @Query("""
        SELECT r FROM DocumentRequest r
        JOIN FETCH r.caseEntity c
        LEFT JOIN FETCH r.requestedBy
        LEFT JOIN FETCH r.fulfilledDocument
        WHERE c.client.username = :username
        ORDER BY r.createdAt DESC
    """)
    List<DocumentRequest> findAllByClientUsername(@Param("username") String username);

    @Query("""
        SELECT r FROM DocumentRequest r
        JOIN FETCH r.caseEntity c
        LEFT JOIN FETCH r.requestedBy
        LEFT JOIN FETCH r.fulfilledDocument
        WHERE r.caseEntity.id = :caseId AND c.client.username = :username
        ORDER BY r.createdAt DESC
    """)
    List<DocumentRequest> findByCaseIdAndClientUsername(@Param("caseId") Long caseId,
                                                        @Param("username") String username);

    @Query("""
        SELECT r FROM DocumentRequest r
        WHERE r.id = :id AND r.caseEntity.client.username = :username
    """)
    Optional<DocumentRequest> findByIdAndClientUsername(@Param("id") Long id,
                                                        @Param("username") String username);

    @Query("""
        SELECT COUNT(r) FROM DocumentRequest r
        WHERE r.caseEntity.client.username = :username
          AND r.status = 'PENDING'
    """)
    long countPendingByClientUsername(@Param("username") String username);
}