package com.lawfirm.service.impl;

import com.lawfirm.dto.CaseCreateDto;
import com.lawfirm.dto.CaseDto;
import com.lawfirm.dto.DashboardStatsDto;
import com.lawfirm.dto.UserCreateDto;
import com.lawfirm.dto.UserDto;
import com.lawfirm.entity.Case;
import com.lawfirm.entity.Role;
import com.lawfirm.entity.User;
import com.lawfirm.repository.CaseRepository;
import com.lawfirm.repository.RoleRepository;
import com.lawfirm.repository.UserRepository;
import com.lawfirm.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCases = caseRepository.count();
        long openCases = caseRepository.countByStatus(Case.CaseStatus.OPEN);
        long closedCases = caseRepository.countByStatus(Case.CaseStatus.CLOSED);
        long inProgressCases = caseRepository.countByStatus(Case.CaseStatus.IN_PROGRESS);

        Role lawyerRole = roleRepository.findByName(Role.RoleName.ROLE_LAWYER).orElse(null);
        Role clientRole = roleRepository.findByName(Role.RoleName.ROLE_CLIENT).orElse(null);

        long totalLawyers = lawyerRole != null ?
                userRepository.findAll().stream()
                        .filter(u -> u.getRoles().contains(lawyerRole)).count() : 0;
        long totalClients = clientRole != null ?
                userRepository.findAll().stream()
                        .filter(u -> u.getRoles().contains(clientRole)).count() : 0;

        return new DashboardStatsDto(totalUsers, totalLawyers, totalClients,
                totalCases, openCases, closedCases, inProgressCases);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getUsersByRole(String role) {
        Role.RoleName roleName = Role.RoleName.valueOf(role);
        Role roleEntity = roleRepository.findByName(roleName).orElseThrow();
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(roleEntity))
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Override
    public UserDto createUser(UserCreateDto dto) {
        if (userRepository.existsByUsername(dto.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Email already in use");

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setBarNumber(dto.getBarNumber());
        user.setSpecialization(dto.getSpecialization());
        user.setYearsOfExperience(dto.getYearsOfExperience());
        user.setStatus(User.UserStatus.ACTIVE);

        Set<Role> roles = new HashSet<>();
        String roleName = dto.getRole() != null ? dto.getRole() : "ROLE_CLIENT";
        Role role = roleRepository.findByName(Role.RoleName.valueOf(roleName))
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        roles.add(role);
        user.setRoles(roles);

        return UserDto.fromEntity(userRepository.save(user));
    }

    @Override
    public UserDto updateUser(Long id, UserCreateDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getBarNumber() != null) user.setBarNumber(dto.getBarNumber());
        if (dto.getSpecialization() != null) user.setSpecialization(dto.getSpecialization());
        if (dto.getYearsOfExperience() != null) user.setYearsOfExperience(dto.getYearsOfExperience());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty())
            user.setPassword(passwordEncoder.encode(dto.getPassword()));

        if (dto.getRole() != null) {
            Set<Role> roles = new HashSet<>();
            Role role = roleRepository.findByName(Role.RoleName.valueOf(dto.getRole()))
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            roles.add(role);
            user.setRoles(roles);
        }

        return UserDto.fromEntity(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDto updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.UserStatus.valueOf(status));
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Override
    public List<CaseDto> getAllCases() {
        return caseRepository.findAll().stream()
                .map(CaseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CaseDto createCase(CaseCreateDto dto) {
        Case c = new Case();
        c.setCaseNumber(dto.getCaseNumber());
        c.setTitle(dto.getTitle());
        c.setDescription(dto.getDescription());
        if (dto.getCaseType() != null && !dto.getCaseType().isEmpty())
            c.setCaseType(Case.CaseType.valueOf(dto.getCaseType()));
        if (dto.getStatus() != null && !dto.getStatus().isEmpty())
            c.setStatus(Case.CaseStatus.valueOf(dto.getStatus()));
        else
            c.setStatus(Case.CaseStatus.OPEN);
        c.setCourtName(dto.getCourtName());
        c.setJudgeName(dto.getJudgeName());
        c.setOpposingCounsel(dto.getOpposingCounsel());
        c.setFeesCharged(dto.getFeesCharged());

        if (dto.getClientId() != null)
            userRepository.findById(dto.getClientId()).ifPresent(c::setClient);
        if (dto.getLawyerId() != null)
            userRepository.findById(dto.getLawyerId()).ifPresent(c::setAssignedLawyer);

        return CaseDto.fromEntity(caseRepository.save(c));
    }

    @Override
    public CaseDto updateCase(Long id, CaseCreateDto dto) {
        Case c = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        if (dto.getTitle() != null) c.setTitle(dto.getTitle());
        if (dto.getDescription() != null) c.setDescription(dto.getDescription());
        if (dto.getCaseType() != null && !dto.getCaseType().isEmpty())
            c.setCaseType(Case.CaseType.valueOf(dto.getCaseType()));
        if (dto.getStatus() != null && !dto.getStatus().isEmpty())
            c.setStatus(Case.CaseStatus.valueOf(dto.getStatus()));
        if (dto.getCourtName() != null) c.setCourtName(dto.getCourtName());
        if (dto.getJudgeName() != null) c.setJudgeName(dto.getJudgeName());
        if (dto.getOpposingCounsel() != null) c.setOpposingCounsel(dto.getOpposingCounsel());
        if (dto.getFeesCharged() != null) c.setFeesCharged(dto.getFeesCharged());
        if (dto.getClientId() != null)
            userRepository.findById(dto.getClientId()).ifPresent(c::setClient);
        if (dto.getLawyerId() != null)
            userRepository.findById(dto.getLawyerId()).ifPresent(c::setAssignedLawyer);

        return CaseDto.fromEntity(caseRepository.save(c));
    }

    @Override
    public void deleteCase(Long id) {
        caseRepository.deleteById(id);
    }

    @Override
    public CaseDto assignLawyer(Long caseId, Long lawyerId) {
        Case c = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        User lawyer = userRepository.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found"));
        c.setAssignedLawyer(lawyer);
        return CaseDto.fromEntity(caseRepository.save(c));
    }
}