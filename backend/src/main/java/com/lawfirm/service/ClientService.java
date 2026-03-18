package com.lawfirm.service;

import com.lawfirm.dto.ClientCaseDto;
import com.lawfirm.dto.ClientDashboardDto;
import com.lawfirm.dto.HearingDto;
import com.lawfirm.dto.MessageDto;
import com.lawfirm.dto.SendMessageRequest;

import java.util.List;

public interface ClientService {

    /** Full dashboard snapshot for the logged-in client */
    ClientDashboardDto getDashboard(String username);

    /** All cases belonging to the logged-in client */
    List<ClientCaseDto> getMyCases(String username);

    /** Single case detail — only if it belongs to this client */
    ClientCaseDto getCaseDetail(String username, Long caseId);

    /** All upcoming hearings for the logged-in client */
    List<HearingDto> getMyHearings(String username);

    /** Hearings for a specific case */
    List<HearingDto> getHearingsForCase(String username, Long caseId);

    /**
     * Full conversation between the client and the lawyer
     * on a specific case, marked read automatically.
     */
    List<MessageDto> getConversation(String username, Long caseId);

    /** Send a message to the assigned lawyer on a case */
    MessageDto sendMessage(String username, SendMessageRequest request);

    /** Total unread message count for this client */
    long getUnreadCount(String username);
}