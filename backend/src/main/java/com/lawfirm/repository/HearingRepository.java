package com.lawfirm.repository;

import com.lawfirm.entity.Hearing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HearingRepository extends JpaRepository<Hearing, Long> {

    /** All hearings for a specific case */
    List<Hearing> findByCaseEntityIdOrderByHearingDateAsc(Long caseId);

    /** All upcoming hearings for a client (across all their cases) */
    @Query("""
        SELECT h FROM Hearing h
        WHERE h.caseEntity.client.id = :clientId
          AND h.hearingDate >= :now
          AND h.status = 'SCHEDULED'
        ORDER BY h.hearingDate ASC
    """)
    List<Hearing> findUpcomingByClientId(@Param("clientId") Long clientId,
                                         @Param("now") LocalDateTime now);

    /** All hearings for a client's case */
    @Query("""
        SELECT h FROM Hearing h
        WHERE h.caseEntity.client.id = :clientId
        ORDER BY h.hearingDate DESC
    """)
    List<Hearing> findAllByClientId(@Param("clientId") Long clientId);
}