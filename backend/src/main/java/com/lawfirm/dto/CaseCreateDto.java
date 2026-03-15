package com.lawfirm.dto;

public class CaseCreateDto {
    private String caseNumber;
    private String title;
    private String description;
    private String caseType;
    private String status;
    private String courtName;
    private String judgeName;
    private String opposingCounsel;
    private Double feesCharged;
    private Long clientId;
    private Long lawyerId;
    private String nextHearingDate;

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCaseType() { return caseType; }
    public void setCaseType(String caseType) { this.caseType = caseType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCourtName() { return courtName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }
    public String getJudgeName() { return judgeName; }
    public void setJudgeName(String judgeName) { this.judgeName = judgeName; }
    public String getOpposingCounsel() { return opposingCounsel; }
    public void setOpposingCounsel(String opposingCounsel) { this.opposingCounsel = opposingCounsel; }
    public Double getFeesCharged() { return feesCharged; }
    public void setFeesCharged(Double feesCharged) { this.feesCharged = feesCharged; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public Long getLawyerId() { return lawyerId; }
    public void setLawyerId(Long lawyerId) { this.lawyerId = lawyerId; }
    public String getNextHearingDate() { return nextHearingDate; }
    public void setNextHearingDate(String nextHearingDate) { this.nextHearingDate = nextHearingDate; }
}