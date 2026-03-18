package com.lawfirm.dto;
 
import com.lawfirm.entity.User;
 
public class LawyerSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String specialization;
    private Integer yearsOfExperience;
    private String barNumber;
 
    public static LawyerSummaryDto fromEntity(User lawyer) {
        LawyerSummaryDto dto = new LawyerSummaryDto();
        dto.setId(lawyer.getId());
        dto.setFullName(lawyer.getFirstName() + " " + lawyer.getLastName());
        dto.setEmail(lawyer.getEmail());
        dto.setPhoneNumber(lawyer.getPhoneNumber());
        dto.setSpecialization(lawyer.getSpecialization());
        dto.setYearsOfExperience(lawyer.getYearsOfExperience());
        dto.setBarNumber(lawyer.getBarNumber());
        return dto;
    }
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public String getBarNumber() { return barNumber; }
    public void setBarNumber(String barNumber) { this.barNumber = barNumber; }
}