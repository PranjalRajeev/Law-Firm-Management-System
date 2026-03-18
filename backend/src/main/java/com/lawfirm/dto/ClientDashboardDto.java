package com.lawfirm.dto;
 
import java.util.List;
 
public class ClientDashboardDto {
 
    private LawyerSummaryDto assignedLawyer;   // null if no active case with lawyer
    private int totalCases;
    private int openCases;
    private int inProgressCases;
    private int closedCases;
    private double totalFees;
    private double totalSettlement;
    private List<ClientCaseDto> recentCases;   // last 5
    private List<HearingDto> upcomingHearings; // next 5
    private long unreadMessages;
 
    // Getters and Setters
    public LawyerSummaryDto getAssignedLawyer() { return assignedLawyer; }
    public void setAssignedLawyer(LawyerSummaryDto assignedLawyer) { this.assignedLawyer = assignedLawyer; }
 
    public int getTotalCases() { return totalCases; }
    public void setTotalCases(int totalCases) { this.totalCases = totalCases; }
 
    public int getOpenCases() { return openCases; }
    public void setOpenCases(int openCases) { this.openCases = openCases; }
 
    public int getInProgressCases() { return inProgressCases; }
    public void setInProgressCases(int inProgressCases) { this.inProgressCases = inProgressCases; }
 
    public int getClosedCases() { return closedCases; }
    public void setClosedCases(int closedCases) { this.closedCases = closedCases; }
 
    public double getTotalFees() { return totalFees; }
    public void setTotalFees(double totalFees) { this.totalFees = totalFees; }
 
    public double getTotalSettlement() { return totalSettlement; }
    public void setTotalSettlement(double totalSettlement) { this.totalSettlement = totalSettlement; }
 
    public List<ClientCaseDto> getRecentCases() { return recentCases; }
    public void setRecentCases(List<ClientCaseDto> recentCases) { this.recentCases = recentCases; }
 
    public List<HearingDto> getUpcomingHearings() { return upcomingHearings; }
    public void setUpcomingHearings(List<HearingDto> upcomingHearings) { this.upcomingHearings = upcomingHearings; }
 
    public long getUnreadMessages() { return unreadMessages; }
    public void setUnreadMessages(long unreadMessages) { this.unreadMessages = unreadMessages; }
}