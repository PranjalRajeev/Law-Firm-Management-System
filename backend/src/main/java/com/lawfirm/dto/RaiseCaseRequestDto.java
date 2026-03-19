package com.lawfirm.dto;
 
import com.lawfirm.entity.Case;
import com.lawfirm.entity.CaseRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
 
public class RaiseCaseRequestDto {
 
    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;
 
    @NotBlank(message = "Description is required")
    private String description;
 
    @NotNull(message = "Case type is required")
    private Case.CaseType caseType;
 
    private CaseRequest.UrgencyLevel urgency = CaseRequest.UrgencyLevel.MEDIUM;
 
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Case.CaseType getCaseType() { return caseType; }
    public void setCaseType(Case.CaseType caseType) { this.caseType = caseType; }
    public CaseRequest.UrgencyLevel getUrgency() { return urgency; }
    public void setUrgency(CaseRequest.UrgencyLevel urgency) { this.urgency = urgency; }
}