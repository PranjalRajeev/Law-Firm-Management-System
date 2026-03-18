package com.lawfirm.service.impl;

import com.lawfirm.dto.*;
import com.lawfirm.entity.Case;
import com.lawfirm.entity.Hearing;
import com.lawfirm.entity.Message;
import com.lawfirm.entity.User;
import com.lawfirm.repository.CaseRepository;
import com.lawfirm.repository.HearingRepository;
import com.lawfirm.repository.MessageRepository;
import com.lawfirm.repository.UserRepository;
import com.lawfirm.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClientServiceImpl implements ClientService {

    @Autowired private UserRepository    userRepository;
    @Autowired private CaseRepository    caseRepository;
    @Autowired private HearingRepository hearingRepository;
    @Autowired private MessageRepository messageRepository;

    // ── Helper ────────────────────────────────────────────────────────────────

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

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ClientDashboardDto getDashboard(String username) {
        User client = getClient(username);

        List<Case> cases = caseRepository.findByClientId(client.getId());

        ClientDashboardDto dto = new ClientDashboardDto();
        dto.setTotalCases(cases.size());
        dto.setOpenCases((int) cases.stream().filter(c -> c.getStatus() == Case.CaseStatus.OPEN).count());
        dto.setInProgressCases((int) cases.stream().filter(c -> c.getStatus() == Case.CaseStatus.IN_PROGRESS).count());
        dto.setClosedCases((int) cases.stream().filter(c ->
                c.getStatus() == Case.CaseStatus.CLOSED || c.getStatus() == Case.CaseStatus.SETTLED).count());

        dto.setTotalFees(cases.stream()
                .mapToDouble(c -> c.getFeesCharged() != null ? c.getFeesCharged() : 0.0).sum());
        dto.setTotalSettlement(cases.stream()
                .mapToDouble(c -> c.getSettlementAmount() != null ? c.getSettlementAmount() : 0.0).sum());

        // Most recently updated active case's lawyer as "assigned lawyer"
        cases.stream()
                .filter(c -> c.getAssignedLawyer() != null &&
                        (c.getStatus() == Case.CaseStatus.OPEN || c.getStatus() == Case.CaseStatus.IN_PROGRESS))
                .max(Comparator.comparing(Case::getUpdatedAt))
                .ifPresent(c -> dto.setAssignedLawyer(LawyerSummaryDto.fromEntity(c.getAssignedLawyer())));

        // Recent 5 cases
        dto.setRecentCases(cases.stream()
                .sorted(Comparator.comparing(Case::getUpdatedAt).reversed())
                .limit(5)
                .map(c -> toCaseDto(c, client.getId()))
                .collect(Collectors.toList()));

        // Upcoming hearings
        dto.setUpcomingHearings(hearingRepository
                .findUpcomingByClientId(client.getId(), LocalDateTime.now())
                .stream().limit(5).map(HearingDto::fromEntity).collect(Collectors.toList()));

        // Unread messages
        long unread = cases.stream()
                .filter(c -> c.getAssignedLawyer() != null)
                .mapToLong(c -> messageRepository.countBySenderIdAndReceiverIdAndIsReadFalse(
                        c.getAssignedLawyer().getId(), client.getId()))
                .sum();
        dto.setUnreadMessages(unread);

        return dto;
    }

    // ── Cases ─────────────────────────────────────────────────────────────────

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

    // ── Hearings ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<HearingDto> getMyHearings(String username) {
        User client = getClient(username);
        return hearingRepository.findAllByClientId(client.getId())
                .stream().map(HearingDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HearingDto> getHearingsForCase(String username, Long caseId) {
        User client = getClient(username);
        getClientCase(caseId, client.getId()); // ownership check
        return hearingRepository.findByCaseEntityIdOrderByHearingDateAsc(caseId)
                .stream().map(HearingDto::fromEntity).collect(Collectors.toList());
    }

    // ── Messages ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<MessageDto> getConversation(String username, Long caseId) {
        User client = getClient(username);
        Case c = getClientCase(caseId, client.getId());

        if (c.getAssignedLawyer() == null) {
            return List.of();
        }

        Long lawyerId = c.getAssignedLawyer().getId();

        // Mark lawyer's messages to this client as read
        messageRepository.markConversationAsRead(caseId, lawyerId, client.getId());

        return messageRepository.findConversation(caseId, client.getId(), lawyerId)
                .stream().map(MessageDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDto sendMessage(String username, SendMessageRequest request) {
        User client = getClient(username);
        Case c = getClientCase(request.getCaseId(), client.getId());

        if (c.getAssignedLawyer() == null) {
            throw new RuntimeException("No lawyer assigned to this case yet.");
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Validate the receiver is actually the lawyer on this case
        if (!receiver.getId().equals(c.getAssignedLawyer().getId())) {
            throw new RuntimeException("You can only message the lawyer assigned to this case.");
        }

        Message message = new Message();
        message.setContent(request.getContent());
        message.setType(Message.MessageType.valueOf(
                request.getType() != null ? request.getType() : "TEXT"));
        message.setSender(client);
        message.setReceiver(receiver);
        message.setCaseEntity(c);
        message.setAttachmentUrl(request.getAttachmentUrl());
        message.setIsRead(false);

        return MessageDto.fromEntity(messageRepository.save(message));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        User client = getClient(username);
        return caseRepository.findByClientId(client.getId()).stream()
                .filter(c -> c.getAssignedLawyer() != null)
                .mapToLong(c -> messageRepository.countBySenderIdAndReceiverIdAndIsReadFalse(
                        c.getAssignedLawyer().getId(), client.getId()))
                .sum();
    }
}