package com.lawfirm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cases")
public class Case {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(name = "case_number", unique = true)
    private String caseNumber;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private CaseType caseType;

    @Enumerated(EnumType.STRING)
    private CaseStatus status = CaseStatus.OPEN;

    @Column(name = "date_opened")
    private LocalDateTime dateOpened;

    @Column(name = "date_closed")
    private LocalDateTime dateClosed;

    @Column(name = "next_hearing_date")
    private LocalDateTime nextHearingDate;

    @Column(name = "court_name")
    private String courtName;

    @Column(name = "judge_name")
    private String judgeName;

    @Column(name = "opposing_counsel")
    private String opposingCounsel;

    @Column(columnDefinition = "DECIMAL(15,2)")
    private Double settlementAmount;

    @Column(columnDefinition = "DECIMAL(15,2)")
    private Double feesCharged;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_lawyer_id")
    private User assignedLawyer;

    @OneToMany(mappedBy = "caseEntity", cascade = CascadeType.ALL)
    private Set<Document> documents = new HashSet<>();

    @OneToMany(mappedBy = "caseEntity", cascade = CascadeType.ALL)
    private Set<Message> messages = new HashSet<>();

    public enum CaseType {
        CRIMINAL, CIVIL, FAMILY, CORPORATE, REAL_ESTATE, IMMIGRATION, TAX, LABOR, INTELLECTUAL_PROPERTY, OTHER
    }

    public enum CaseStatus {
        OPEN, IN_PROGRESS, CLOSED, SETTLED, DISMISSED, APPEALED
    }

    public Case() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.dateOpened = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public CaseType getCaseType() { return caseType; }
    public void setCaseType(CaseType caseType) { this.caseType = caseType; }

    public CaseStatus getStatus() { return status; }
    public void setStatus(CaseStatus status) { this.status = status; }

    public LocalDateTime getDateOpened() { return dateOpened; }
    public void setDateOpened(LocalDateTime dateOpened) { this.dateOpened = dateOpened; }

    public LocalDateTime getDateClosed() { return dateClosed; }
    public void setDateClosed(LocalDateTime dateClosed) { this.dateClosed = dateClosed; }

    public LocalDateTime getNextHearingDate() { return nextHearingDate; }
    public void setNextHearingDate(LocalDateTime nextHearingDate) { this.nextHearingDate = nextHearingDate; }

    public String getCourtName() { return courtName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }

    public String getJudgeName() { return judgeName; }
    public void setJudgeName(String judgeName) { this.judgeName = judgeName; }

    public String getOpposingCounsel() { return opposingCounsel; }
    public void setOpposingCounsel(String opposingCounsel) { this.opposingCounsel = opposingCounsel; }

    public Double getSettlementAmount() { return settlementAmount; }
    public void setSettlementAmount(Double settlementAmount) { this.settlementAmount = settlementAmount; }

    public Double getFeesCharged() { return feesCharged; }
    public void setFeesCharged(Double feesCharged) { this.feesCharged = feesCharged; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }

    public User getAssignedLawyer() { return assignedLawyer; }
    public void setAssignedLawyer(User assignedLawyer) { this.assignedLawyer = assignedLawyer; }

    public Set<Document> getDocuments() { return documents; }
    public void setDocuments(Set<Document> documents) { this.documents = documents; }

    public Set<Message> getMessages() { return messages; }
    public void setMessages(Set<Message> messages) { this.messages = messages; }
}
