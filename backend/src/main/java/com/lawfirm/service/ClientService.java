package com.lawfirm.service;

import com.lawfirm.dto.*;
import java.util.List;

public interface ClientService {

    // ── Dashboard ─────────────────────────────────────────────────────────────
    ClientDashboardDto getDashboard(String username);

    // ── Cases ─────────────────────────────────────────────────────────────────
    List<ClientCaseDto> getMyCases(String username);
    ClientCaseDto getCaseDetail(String username, Long caseId);

    // ── Hearings ──────────────────────────────────────────────────────────────

    /** All hearings (upcoming + past) as a grouped response */
    HearingDto.GroupedHearingsDto getGroupedHearings(String username);

    /** Flat list of ALL hearings for a client across all cases */
    List<HearingDto> getMyHearings(String username);

    /** All hearings for a specific case (with ownership check) */
    List<HearingDto> getHearingsForCase(String username, Long caseId);

    /** Single hearing detail (with ownership check) */
    HearingDto getHearingDetail(String username, Long hearingId);

    // ── Messages ──────────────────────────────────────────────────────────────
    List<MessageDto> getConversation(String username, Long caseId);
    MessageDto sendMessage(String username, SendMessageRequest request);
    Long getUnreadCount(String username);
}