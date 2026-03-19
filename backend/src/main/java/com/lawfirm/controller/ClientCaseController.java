package com.lawfirm.controller;

import com.lawfirm.dto.*;
import com.lawfirm.service.ClientCaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ROLE_CLIENT')")
public class ClientCaseController {

    @Autowired
    private ClientCaseService clientCaseService;

    // ── Case Requests ─────────────────────────────────────────────────────────

    /**
     * POST /api/client/requests
     * Client raises a new case request visible to all lawyers.
     * Body: { title, description, caseType, urgency }
     */
    @PostMapping("/requests")
    public ResponseEntity<CaseRequestDto> raiseRequest(
            Principal principal,
            @Valid @RequestBody RaiseCaseRequestDto dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clientCaseService.raiseRequest(principal.getName(), dto));
    }

    /**
     * GET /api/client/requests
     * Returns all requests raised by this client (PENDING, ACCEPTED, REJECTED).
     */
    @GetMapping("/requests")
    public ResponseEntity<List<CaseRequestDto>> getMyRequests(Principal principal) {
        return ResponseEntity.ok(clientCaseService.getMyRequests(principal.getName()));
    }

    /**
     * DELETE /api/client/requests/{id}
     * Cancel a PENDING request (cannot cancel once accepted/rejected).
     */
    @DeleteMapping("/requests/{id}")
    public ResponseEntity<Void> cancelRequest(Principal principal,
                                               @PathVariable Long id) {
        clientCaseService.cancelRequest(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Cases ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/client/cases/my
     * All formal cases belonging to this client with status, fees, lawyer info.
     */
    @GetMapping("/cases/my")
    public ResponseEntity<List<ClientCaseDto>> getMyCases(Principal principal) {
        return ResponseEntity.ok(clientCaseService.getMyCases(principal.getName()));
    }

    /**
     * GET /api/client/cases/my/{id}
     * Full detail of one case — only accessible if the client owns it.
     */
    @GetMapping("/cases/my/{id}")
    public ResponseEntity<ClientCaseDto> getCaseDetail(Principal principal,
                                                        @PathVariable Long id) {
        return ResponseEntity.ok(clientCaseService.getCaseDetail(principal.getName(), id));
    }

    /**
     * GET /api/client/cases/my/{id}/documents
     * All documents attached to a specific case.
     */
    @GetMapping("/cases/my/{id}/documents")
    public ResponseEntity<List<DocumentDto>> getCaseDocuments(Principal principal,
                                                               @PathVariable Long id) {
        return ResponseEntity.ok(clientCaseService.getCaseDocuments(principal.getName(), id));
    }
}