package com.lawfirm.repository;

import com.lawfirm.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /** Full conversation between two users on a specific case, oldest first */
    @Query("""
        SELECT m FROM Message m
        WHERE m.caseEntity.id = :caseId
          AND (
            (m.sender.id = :userId AND m.receiver.id = :otherId)
            OR
            (m.sender.id = :otherId AND m.receiver.id = :userId)
          )
        ORDER BY m.createdAt ASC
    """)
    List<Message> findConversation(@Param("caseId")  Long caseId,
                                   @Param("userId")  Long userId,
                                   @Param("otherId") Long otherId);

    /** All messages in a case thread (for both participants) */
    @Query("""
        SELECT m FROM Message m
        WHERE m.caseEntity.id = :caseId
        ORDER BY m.createdAt ASC
    """)
    List<Message> findByCaseId(@Param("caseId") Long caseId);

    /** Count unread messages for a receiver */
    long countBySenderIdAndReceiverIdAndIsReadFalse(Long senderId, Long receiverId);

    /** Mark all messages in a conversation as read */
    @Modifying
    @Transactional
    @Query("""
        UPDATE Message m SET m.isRead = true
        WHERE m.caseEntity.id = :caseId
          AND m.sender.id = :senderId
          AND m.receiver.id = :receiverId
          AND m.isRead = false
    """)
    void markConversationAsRead(@Param("caseId")    Long caseId,
                                @Param("senderId")  Long senderId,
                                @Param("receiverId") Long receiverId);
}