package com.lawfirm.service;

import com.lawfirm.dto.CaseCreateDto;
import com.lawfirm.dto.CaseDto;
import com.lawfirm.dto.DashboardStatsDto;
import com.lawfirm.dto.UserCreateDto;
import com.lawfirm.dto.UserDto;
import java.util.List;

public interface AdminService {
    DashboardStatsDto getDashboardStats();
    List<UserDto> getAllUsers();
    List<UserDto> getUsersByRole(String role);
    UserDto getUserById(Long id);
    UserDto createUser(UserCreateDto dto);
    UserDto updateUser(Long id, UserCreateDto dto);
    void deleteUser(Long id);
    UserDto updateUserStatus(Long id, String status);
    List<CaseDto> getAllCases();
    CaseDto createCase(CaseCreateDto dto);
    CaseDto updateCase(Long id, CaseCreateDto dto);
    void deleteCase(Long id);
    CaseDto assignLawyer(Long caseId, Long lawyerId);
}