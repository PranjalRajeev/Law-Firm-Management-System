package com.lawfirm.repository;

import com.lawfirm.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCaseEntityId(Long caseId);
    
    @Query("SELECT d FROM Document d WHERE d.uploadedByUser.id = :userId")
    List<Document> findByUploadedByUser(@Param("userId") Long userId);
    
    List<Document> findByDocumentType(Document.DocumentType documentType);
    List<Document> findByStatus(Document.DocumentStatus status);
    
    @Query("SELECT d FROM Document d WHERE d.title LIKE %:keyword% OR d.description LIKE %:keyword% OR d.fileName LIKE %:keyword%")
    List<Document> searchDocuments(@Param("keyword") String keyword);
    
    @Query("SELECT COUNT(d) FROM Document d WHERE d.caseEntity.id = :caseId")
    Long countByCaseId(@Param("caseId") Long caseId);
}
