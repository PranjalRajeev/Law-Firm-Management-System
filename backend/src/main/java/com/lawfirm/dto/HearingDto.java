package com.lawfirm.dto;
 
import com.lawfirm.entity.Hearing;
import java.time.LocalDateTime;
 
public class HearingDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime hearingDate;
    private String courtName;
    private String courtRoom;
    private String judgeName;
    private String status;
    private String notes;
    private Long caseId;
    private String caseNumber;
    private String caseTitle;
 
    public static HearingDto fromEntity(Hearing h) {
        HearingDto dto = new HearingDto();
        dto.setId(h.getId());
        dto.setTitle(h.getTitle());
        dto.setDescription(h.getDescription());
        dto.setHearingDate(h.getHearingDate());
        dto.setCourtName(h.getCourtName());
        dto.setCourtRoom(h.getCourtRoom());
        dto.setJudgeName(h.getJudgeName());
        dto.setStatus(h.getStatus().name());
        dto.setNotes(h.getNotes());
        if (h.getCaseEntity() != null) {
            dto.setCaseId(h.getCaseEntity().getId());
            dto.setCaseNumber(h.getCaseEntity().getCaseNumber());
            dto.setCaseTitle(h.getCaseEntity().getTitle());
        }
        return dto;
    }
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getHearingDate() { return hearingDate; }
    public void setHearingDate(LocalDateTime hearingDate) { this.hearingDate = hearingDate; }
    public String getCourtName() { return courtName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }
    public String getCourtRoom() { return courtRoom; }
    public void setCourtRoom(String courtRoom) { this.courtRoom = courtRoom; }
    public String getJudgeName() { return judgeName; }
    public void setJudgeName(String judgeName) { this.judgeName = judgeName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }
    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getCaseTitle() { return caseTitle; }
    public void setCaseTitle(String caseTitle) { this.caseTitle = caseTitle; }
}