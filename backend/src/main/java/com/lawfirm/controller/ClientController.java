package com.lawfirm.controller;

import com.lawfirm.dto.*;
import com.lawfirm.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ROLE_CLIENT')")
public class ClientController {

    @Autowired
    private ClientService clientService;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    /** GET /api/client/dashboard */
    @GetMapping("/dashboard")
    public ResponseEntity<ClientDashboardDto> getDashboard(Principal principal) {
        return ResponseEntity.ok(clientService.getDashboard(principal.getName()));
    }

    // ── Cases ─────────────────────────────────────────────────────────────────

    /** GET /api/client/cases */
    @GetMapping("/cases")
    public ResponseEntity<List<ClientCaseDto>> getMyCases(Principal principal) {
        return ResponseEntity.ok(clientService.getMyCases(principal.getName()));
    }

    /** GET /api/client/cases/{id} */
    @GetMapping("/cases/{id}")
    public ResponseEntity<ClientCaseDto> getCaseDetail(Principal principal,
                                                        @PathVariable Long id) {
        return ResponseEntity.ok(clientService.getCaseDetail(principal.getName(), id));
    }

    // ── Hearings ──────────────────────────────────────────────────────────────

    /**
     * GET /api/client/hearings/grouped
     * Returns { upcoming: [...], past: [...], totalUpcoming, totalPast }
     * Used by the main hearings page.
     */
    @GetMapping("/hearings/grouped")
    public ResponseEntity<HearingDto.GroupedHearingsDto> getGroupedHearings(Principal principal) {
        return ResponseEntity.ok(clientService.getGroupedHearings(principal.getName()));
    }

    /**
     * GET /api/client/hearings
     * Flat list of all hearings across all client's cases, sorted by date ASC.
     */
    @GetMapping("/hearings")
    public ResponseEntity<List<HearingDto>> getMyHearings(Principal principal) {
        return ResponseEntity.ok(clientService.getMyHearings(principal.getName()));
    }

    /**
     * GET /api/client/hearings/{hearingId}
     * Full detail of a single hearing (with ownership check).
     */
    @GetMapping("/hearings/{hearingId}")
    public ResponseEntity<HearingDto> getHearingDetail(Principal principal,
                                                        @PathVariable Long hearingId) {
        return ResponseEntity.ok(clientService.getHearingDetail(principal.getName(), hearingId));
    }

    /**
     * GET /api/client/cases/{caseId}/hearings
     * All hearings for one specific case.
     */
    @GetMapping("/cases/{caseId}/hearings")
    public ResponseEntity<List<HearingDto>> getHearingsForCase(Principal principal,
                                                                @PathVariable Long caseId) {
        return ResponseEntity.ok(clientService.getHearingsForCase(principal.getName(), caseId));
    }

    // ── Messages ──────────────────────────────────────────────────────────────

    /** GET /api/client/cases/{caseId}/messages */
    @GetMapping("/cases/{caseId}/messages")
    public ResponseEntity<List<MessageDto>> getConversation(Principal principal,
                                                             @PathVariable Long caseId) {
        return ResponseEntity.ok(clientService.getConversation(principal.getName(), caseId));
    }

    /** POST /api/client/messages/send */
    @PostMapping("/messages/send")
    public ResponseEntity<MessageDto> sendMessage(Principal principal,
                                                   @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(clientService.sendMessage(principal.getName(), request));
    }

    /** GET /api/client/messages/unread-count */
    @GetMapping("/messages/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        return ResponseEntity.ok(clientService.getUnreadCount(principal.getName()));
    }
}