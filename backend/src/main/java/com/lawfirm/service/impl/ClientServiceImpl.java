package com.lawfirm.service.impl;

import com.lawfirm.dto.*;
import com.lawfirm.entity.Case;
import com.lawfirm.entity.Hearing;
import com.lawfirm.entity.Message;
import com.lawfirm.entity.User;
import com.lawfirm.repository.*;
import com.lawfirm.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ClientServiceImpl implements ClientService {

    @Autowired private HearingRepository hearingRepository;
    @Autowired private CaseRepository    caseRepository;
    @Autowired private UserRepository    userRepository;
    @Autowired private MessageRepository messageRepository;

    // ── Dashboard ─────────────────────────────────────────────────────────────
    @Override
    public ClientDashboardDto getDashboard(String username) {
        User user = resolveUser(username);
        List<Case> cases = caseRepository.findByClientUsername(username);

        // Case counts
        int open       = (int) cases.stream().filter(c -> c.getStatus() == Case.CaseStatus.OPEN).count();
        int inProgress = (int) cases.stream().filter(c -> c.getStatus() == Case.CaseStatus.IN_PROGRESS).count();
        int closed     = (int) cases.stream().filter(c -> c.getStatus() == Case.CaseStatus.CLOSED).count();

        // Fees / settlement totals
        double totalFees       = cases.stream().filter(c -> c.getFeesCharged()      != null).mapToDouble(Case::getFeesCharged).sum();
        double totalSettlement = cases.stream().filter(c -> c.getSettlementAmount() != null).mapToDouble(Case::getSettlementAmount).sum();

        // Unread messages across all cases where this client is receiver
        long unread = countUnreadForUser(user);

        // Recent cases (last 5) — 0 unread per-case for the summary list
        List<ClientCaseDto> recentCases = cases.stream()
                .limit(5)
                .map(c -> ClientCaseDto.fromEntity(c, 0L))
                .collect(Collectors.toList());

        // Upcoming hearings (next 5)
        List<HearingDto> upcomingHearings = hearingRepository
                .findUpcomingByClientUsername(username, LocalDateTime.now())
                .stream()
                .limit(5)
                .map(HearingDto::fromEntity)
                .collect(Collectors.toList());

        // Assigned lawyer — from first active case that has one
        LawyerSummaryDto lawyerSummary = cases.stream()
                .filter(c -> c.getAssignedLawyer() != null
                          && (c.getStatus() == Case.CaseStatus.OPEN
                           || c.getStatus() == Case.CaseStatus.IN_PROGRESS))
                .findFirst()
                .map(c -> LawyerSummaryDto.fromEntity(c.getAssignedLawyer()))
                .orElse(null);

        ClientDashboardDto dto = new ClientDashboardDto();
        dto.setTotalCases(cases.size());
        dto.setOpenCases(open);
        dto.setInProgressCases(inProgress);
        dto.setClosedCases(closed);
        dto.setTotalFees(totalFees);
        dto.setTotalSettlement(totalSettlement);
        dto.setUnreadMessages(unread);
        dto.setRecentCases(recentCases);
        dto.setUpcomingHearings(upcomingHearings);
        dto.setAssignedLawyer(lawyerSummary);
        return dto;
    }

    // ── Cases ─────────────────────────────────────────────────────────────────
    @Override
    public List<ClientCaseDto> getMyCases(String username) {
        User user = resolveUser(username);
        return caseRepository.findByClientUsername(username)
                .stream()
                .map(c -> {
                    long unread = c.getAssignedLawyer() != null
                            ? messageRepository.countBySenderIdAndReceiverIdAndIsReadFalse(
                                    c.getAssignedLawyer().getId(), user.getId())
                            : 0L;
                    return ClientCaseDto.fromEntity(c, unread);
                })
                .collect(Collectors.toList());
    }

    @Override
    public ClientCaseDto getCaseDetail(String username, Long caseId) {
        User user = resolveUser(username);
        Case c = caseRepository.findByIdAndClientUsername(caseId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Case not found"));
        long unread = c.getAssignedLawyer() != null
                ? messageRepository.countBySenderIdAndReceiverIdAndIsReadFalse(
                        c.getAssignedLawyer().getId(), user.getId())
                : 0L;
        return ClientCaseDto.fromEntity(c, unread);
    }

    // ── Hearings ──────────────────────────────────────────────────────────────
    @Override
    public HearingDto.GroupedHearingsDto getGroupedHearings(String username) {
        LocalDateTime now = LocalDateTime.now();
        List<HearingDto> upcoming = hearingRepository
                .findUpcomingByClientUsername(username, now)
                .stream().map(HearingDto::fromEntity).collect(Collectors.toList());
        List<HearingDto> past = hearingRepository
                .findPastByClientUsername(username, now)
                .stream().map(HearingDto::fromEntity).collect(Collectors.toList());
        return new HearingDto.GroupedHearingsDto(upcoming, past);
    }

    @Override
    public List<HearingDto> getMyHearings(String username) {
        return hearingRepository.findAllByClientUsername(username)
                .stream().map(HearingDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    public List<HearingDto> getHearingsForCase(String username, Long caseId) {
        caseRepository.findByIdAndClientUsername(caseId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Case not found"));
        return hearingRepository.findByCaseIdAndClientUsername(caseId, username)
                .stream().map(HearingDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    public HearingDto getHearingDetail(String username, Long hearingId) {
        Hearing h = hearingRepository.findByIdAndClientUsername(hearingId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hearing not found"));
        return HearingDto.fromEntity(h);
    }

    // ── Messages ──────────────────────────────────────────────────────────────
    @Override
    public List<MessageDto> getConversation(String username, Long caseId) {
        User user = resolveUser(username);
        Case c = caseRepository.findByIdAndClientUsername(caseId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Case not found"));

        Long lawyerId = c.getAssignedLawyer() != null ? c.getAssignedLawyer().getId() : -1L;

        // Uses MessageRepository.findConversation(caseId, userId, otherId)
        List<Message> messages = messageRepository.findConversation(caseId, user.getId(), lawyerId);

        // Mark lawyer → client messages as read
        if (c.getAssignedLawyer() != null) {
            messageRepository.markConversationAsRead(caseId, lawyerId, user.getId());
        }

        return messages.stream().map(MessageDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDto sendMessage(String username, SendMessageRequest request) {
        // Keep your existing sendMessage logic here
        throw new UnsupportedOperationException("Plug in your existing sendMessage logic");
    }

    @Override
    public Long getUnreadCount(String username) {
        return countUnreadForUser(resolveUser(username));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private User resolveUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    /**
     * Sums unread counts across ALL cases where this client is receiver.
     * Uses existing MessageRepository.countBySenderIdAndReceiverIdAndIsReadFalse().
     */
    private long countUnreadForUser(User user) {
        return caseRepository.findByClientUsername(user.getUsername())
                .stream()
                .filter(c -> c.getAssignedLawyer() != null)
                .mapToLong(c -> messageRepository.countBySenderIdAndReceiverIdAndIsReadFalse(
                        c.getAssignedLawyer().getId(), user.getId()))
                .sum();
    }
}