package com.lawfirm.service.impl;

import com.lawfirm.dto.*;
import com.lawfirm.entity.Case;
import com.lawfirm.entity.CaseRequest;
import com.lawfirm.entity.Document;
import com.lawfirm.entity.User;
import com.lawfirm.repository.CaseRepository;
import com.lawfirm.repository.CaseRequestRepository;
import com.lawfirm.repository.MessageRepository;
import com.lawfirm.repository.UserRepository;
import com.lawfirm.service.ClientCaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClientCaseServiceImpl implements ClientCaseService {

    @Autowired private UserRepository        userRepository;
    @Autowired private CaseRepository        caseRepository;
    @Autowired private CaseRequestRepository requestRepository;
    @Autowired private MessageRepository     messageRepository;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User getClient(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private Case getClientCase(Long caseId, Long clientId) {
        Case c = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));
        if (c.getClient() == null || !c.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Access denied to case: " + caseId);
        }
        return c;
    }

    private ClientCaseDto toCaseDto(Case c, Long clientId) {
        long unread = 0;
        if (c.getAssignedLawyer() != null) {
            unread = messageRepository.countBySenderIdAndReceiverIdAndIsReadFalse(
                    c.getAssignedLawyer().getId(), clientId);
        }
        return ClientCaseDto.fromEntity(c, unread);
    }

    // ── Raise a request ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public CaseRequestDto raiseRequest(String username, RaiseCaseRequestDto dto) {
        User client = getClient(username);

        CaseRequest request = new CaseRequest();
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCaseType(dto.getCaseType());
        request.setUrgency(dto.getUrgency() != null
                ? dto.getUrgency()
                : CaseRequest.UrgencyLevel.MEDIUM);
        request.setStatus(CaseRequest.RequestStatus.PENDING);
        request.setClient(client);

        return CaseRequestDto.fromEntity(requestRepository.save(request));
    }

    // ── List client's own requests ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<CaseRequestDto> getMyRequests(String username) {
        User client = getClient(username);
        return requestRepository
                .findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(CaseRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    // ── Cancel a pending request ──────────────────────────────────────────────

    @Override
    @Transactional
    public void cancelRequest(String username, Long requestId) {
        User client = getClient(username);
        CaseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));

        if (!request.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Access denied to request: " + requestId);
        }
        if (request.getStatus() != CaseRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Only PENDING requests can be cancelled.");
        }

        requestRepository.delete(request);
    }

    // ── My Cases ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ClientCaseDto> getMyCases(String username) {
        User client = getClient(username);
        return caseRepository.findByClientId(client.getId())
                .stream()
                .sorted(Comparator.comparing(Case::getUpdatedAt).reversed())
                .map(c -> toCaseDto(c, client.getId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClientCaseDto getCaseDetail(String username, Long caseId) {
        User client = getClient(username);
        Case c = getClientCase(caseId, client.getId());
        return toCaseDto(c, client.getId());
    }

    // ── Documents for a case ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<DocumentDto> getCaseDocuments(String username, Long caseId) {
        User client = getClient(username);
        Case c = getClientCase(caseId, client.getId());

        return c.getDocuments()
                .stream()
                .filter(d -> d.getStatus() != Document.DocumentStatus.ARCHIVED)
                .sorted(Comparator.comparing(Document::getUploadedAt).reversed())
                .map(DocumentDto::fromEntity)
                .collect(Collectors.toList());
    }
}