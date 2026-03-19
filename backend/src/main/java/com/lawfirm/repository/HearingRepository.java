package com.lawfirm.repository;

import com.lawfirm.entity.Hearing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HearingRepository extends JpaRepository<Hearing, Long> {

    /** All hearings for a specific case, ascending */
    List<Hearing> findByCaseEntityIdOrderByHearingDateAsc(Long caseId);

    /**
     * All hearings across ALL cases belonging to a client (by username).
     * Case.client is a User; User.username = principal.getName()
     */
    @Query("""
        SELECT h FROM Hearing h
        JOIN FETCH h.caseEntity c
        WHERE c.client.username = :username
        ORDER BY h.hearingDate ASC
    """)
    List<Hearing> findAllByClientUsername(@Param("username") String username);

    /**
     * Upcoming SCHEDULED hearings for a client.
     */
    @Query("""
        SELECT h FROM Hearing h
        JOIN FETCH h.caseEntity c
        WHERE c.client.username = :username
          AND h.hearingDate >= :now
          AND h.status = 'SCHEDULED'
        ORDER BY h.hearingDate ASC
    """)
    List<Hearing> findUpcomingByClientUsername(@Param("username") String username,
                                               @Param("now") LocalDateTime now);

    /**
     * Past hearings for a client.
     */
    @Query("""
        SELECT h FROM Hearing h
        JOIN FETCH h.caseEntity c
        WHERE c.client.username = :username
          AND h.hearingDate < :now
        ORDER BY h.hearingDate DESC
    """)
    List<Hearing> findPastByClientUsername(@Param("username") String username,
                                           @Param("now") LocalDateTime now);

    /**
     * Hearings for one specific case, verifying ownership by username.
     */
    @Query("""
        SELECT h FROM Hearing h
        JOIN FETCH h.caseEntity c
        WHERE c.id = :caseId
          AND c.client.username = :username
        ORDER BY h.hearingDate ASC
    """)
    List<Hearing> findByCaseIdAndClientUsername(@Param("caseId") Long caseId,
                                                @Param("username") String username);

    /**
     * Single hearing detail with ownership check.
     */
    @Query("""
        SELECT h FROM Hearing h
        JOIN FETCH h.caseEntity c
        WHERE h.id = :hearingId
          AND c.client.username = :username
    """)
    Optional<Hearing> findByIdAndClientUsername(@Param("hearingId") Long hearingId,
                                                @Param("username") String username);
}