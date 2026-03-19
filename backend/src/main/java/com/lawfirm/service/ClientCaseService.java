package com.lawfirm.service;

import com.lawfirm.dto.CaseRequestDto;
import com.lawfirm.dto.ClientCaseDto;
import com.lawfirm.dto.DocumentDto;
import com.lawfirm.dto.RaiseCaseRequestDto;

import java.util.List;

public interface ClientCaseService {

    // ── Case requests (raise / track) ─────────────────────────────────────────

    /** Raise a new case request — visible to all lawyers */
    CaseRequestDto raiseRequest(String username, RaiseCaseRequestDto dto);

    /** All requests raised by this client */
    List<CaseRequestDto> getMyRequests(String username);

    /** Cancel a PENDING request */
    void cancelRequest(String username, Long requestId);

    // ── Active cases ─────────────────────────────────────────────────────────

    /** All cases where this client is the owner — with status, fees, lawyer */
    List<ClientCaseDto> getMyCases(String username);

    /** Full detail of one case including documents */
    ClientCaseDto getCaseDetail(String username, Long caseId);

    /** Documents attached to a specific case */
    List<DocumentDto> getCaseDocuments(String username, Long caseId);
}