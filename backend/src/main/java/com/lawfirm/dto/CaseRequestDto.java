package com.lawfirm.dto;
 
import com.lawfirm.entity.CaseRequest;
import java.time.LocalDateTime;
 
public class CaseRequestDto {
 
    private Long id;
    private String title;
    private String description;
    private String caseType;
    private String urgency;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
 
    // Client info
    private Long clientId;
    private String clientName;
 
    // Lawyer info (null if PENDING)
    private Long lawyerId;
    private String lawyerName;
 
    // The Case ID created on acceptance (null until accepted)
    private Long createdCaseId;
 
    public static CaseRequestDto fromEntity(CaseRequest r) {
        CaseRequestDto dto = new CaseRequestDto();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setCaseType(r.getCaseType() != null ? r.getCaseType().name() : null);
        dto.setUrgency(r.getUrgency().name());
        dto.setStatus(r.getStatus().name());
        dto.setRejectionReason(r.getRejectionReason());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        dto.setResolvedAt(r.getResolvedAt());
 
        if (r.getClient() != null) {
            dto.setClientId(r.getClient().getId());
            dto.setClientName(r.getClient().getFirstName() + " " + r.getClient().getLastName());
        }
        if (r.getLawyer() != null) {
            dto.setLawyerId(r.getLawyer().getId());
            dto.setLawyerName(r.getLawyer().getFirstName() + " " + r.getLawyer().getLastName());
        }
        if (r.getCreatedCase() != null) {
            dto.setCreatedCaseId(r.getCreatedCase().getId());
        }
        return dto;
    }
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCaseType() { return caseType; }
    public void setCaseType(String caseType) { this.caseType = caseType; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public Long getLawyerId() { return lawyerId; }
    public void setLawyerId(Long lawyerId) { this.lawyerId = lawyerId; }
    public String getLawyerName() { return lawyerName; }
    public void setLawyerName(String lawyerName) { this.lawyerName = lawyerName; }
    public Long getCreatedCaseId() { return createdCaseId; }
    public void setCreatedCaseId(Long createdCaseId) { this.createdCaseId = createdCaseId; }
}