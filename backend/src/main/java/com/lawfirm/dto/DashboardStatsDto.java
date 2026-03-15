package com.lawfirm.dto;

public class DashboardStatsDto {
    private long totalUsers;
    private long totalLawyers;
    private long totalClients;
    private long totalCases;
    private long openCases;
    private long closedCases;
    private long inProgressCases;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalUsers, long totalLawyers, long totalClients,
                              long totalCases, long openCases, long closedCases, long inProgressCases) {
        this.totalUsers = totalUsers;
        this.totalLawyers = totalLawyers;
        this.totalClients = totalClients;
        this.totalCases = totalCases;
        this.openCases = openCases;
        this.closedCases = closedCases;
        this.inProgressCases = inProgressCases;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalLawyers() { return totalLawyers; }
    public void setTotalLawyers(long totalLawyers) { this.totalLawyers = totalLawyers; }
    public long getTotalClients() { return totalClients; }
    public void setTotalClients(long totalClients) { this.totalClients = totalClients; }
    public long getTotalCases() { return totalCases; }
    public void setTotalCases(long totalCases) { this.totalCases = totalCases; }
    public long getOpenCases() { return openCases; }
    public void setOpenCases(long openCases) { this.openCases = openCases; }
    public long getClosedCases() { return closedCases; }
    public void setClosedCases(long closedCases) { this.closedCases = closedCases; }
    public long getInProgressCases() { return inProgressCases; }
    public void setInProgressCases(long inProgressCases) { this.inProgressCases = inProgressCases; }
}