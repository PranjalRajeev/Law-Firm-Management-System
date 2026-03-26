package com.lawfirm.dto;

import com.lawfirm.entity.DocumentRequest;
import java.time.LocalDateTime;

public class DocumentRequestDto {

    private Long   id;
    private String title;
    private String description;
    private String status;          // PENDING | FULFILLED | CANCELLED
    private LocalDateTime createdAt;
    private LocalDateTime fulfilledAt;

    // Case context
    private Long   caseId;
    private String caseNumber;
    private String caseTitle;

    // Who requested
    private String requestedByName;

    // Fulfilled document (if any)
    private Long   fulfilledDocumentId;
    private String fulfilledDocumentTitle;

    public static DocumentRequestDto fromEntity(DocumentRequest r) {
        DocumentRequestDto dto = new DocumentRequestDto();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setStatus(r.getStatus() != null ? r.getStatus().name() : null);
        dto.setCreatedAt(r.getCreatedAt());
        dto.setFulfilledAt(r.getFulfilledAt());

        if (r.getCaseEntity() != null) {
            dto.setCaseId(r.getCaseEntity().getId());
            dto.setCaseNumber(r.getCaseEntity().getCaseNumber());
            dto.setCaseTitle(r.getCaseEntity().getTitle());
        }
        if (r.getRequestedBy() != null) {
            dto.setRequestedByName(
                r.getRequestedBy().getFirstName() + " " + r.getRequestedBy().getLastName());
        }
        if (r.getFulfilledDocument() != null) {
            dto.setFulfilledDocumentId(r.getFulfilledDocument().getId());
            dto.setFulfilledDocumentTitle(r.getFulfilledDocument().getTitle());
        }
        return dto;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getFulfilledAt() { return fulfilledAt; }
    public void setFulfilledAt(LocalDateTime fulfilledAt) { this.fulfilledAt = fulfilledAt; }

    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public String getCaseTitle() { return caseTitle; }
    public void setCaseTitle(String caseTitle) { this.caseTitle = caseTitle; }

    public String getRequestedByName() { return requestedByName; }
    public void setRequestedByName(String requestedByName) { this.requestedByName = requestedByName; }

    public Long getFulfilledDocumentId() { return fulfilledDocumentId; }
    public void setFulfilledDocumentId(Long fulfilledDocumentId) { this.fulfilledDocumentId = fulfilledDocumentId; }

    public String getFulfilledDocumentTitle() { return fulfilledDocumentTitle; }
    public void setFulfilledDocumentTitle(String fulfilledDocumentTitle) { this.fulfilledDocumentTitle = fulfilledDocumentTitle; }
}