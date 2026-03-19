package com.lawfirm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * CaseRequest represents a request raised by a client BEFORE it becomes a formal Case.
 * Lawyers can browse open requests and choose to Accept or Reject them.
 * On Accept, a proper Case is created and linked back to this request.
 */
@Entity
@Table(name = "case_requests")
public class CaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_type")
    private Case.CaseType caseType;

    @Enumerated(EnumType.STRING)
    private UrgencyLevel urgency = UrgencyLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // The client who raised this request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    // The lawyer who accepted/rejected (null while PENDING)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id")
    private User lawyer;

    // The Case created when a lawyer accepts (null until accepted)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private Case createdCase;

    public enum UrgencyLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum RequestStatus {
        PENDING,    // visible to all lawyers, no one has taken it
        ACCEPTED,   // a lawyer accepted — Case has been created
        REJECTED    // lawyer(s) declined — client can resubmit
    }

    public CaseRequest() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters and Setters ───────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Case.CaseType getCaseType() { return caseType; }
    public void setCaseType(Case.CaseType caseType) { this.caseType = caseType; }

    public UrgencyLevel getUrgency() { return urgency; }
    public void setUrgency(UrgencyLevel urgency) { this.urgency = urgency; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }

    public User getLawyer() { return lawyer; }
    public void setLawyer(User lawyer) { this.lawyer = lawyer; }

    public Case getCreatedCase() { return createdCase; }
    public void setCreatedCase(Case createdCase) { this.createdCase = createdCase; }
}