package com.lawfirm.controller;

import com.lawfirm.dto.CaseCreateDto;
import com.lawfirm.dto.CaseDto;
import com.lawfirm.dto.DashboardStatsDto;
import com.lawfirm.dto.UserCreateDto;
import com.lawfirm.dto.UserDto;
import com.lawfirm.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody UserCreateDto dto) {
        return ResponseEntity.ok(adminService.createUser(dto));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id,
                                               @RequestBody UserCreateDto dto) {
        return ResponseEntity.ok(adminService.updateUser(id, dto));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, status));
    }

    @GetMapping("/cases")
    public ResponseEntity<List<CaseDto>> getAllCases() {
        return ResponseEntity.ok(adminService.getAllCases());
    }

    @PostMapping("/cases")
    public ResponseEntity<CaseDto> createCase(@RequestBody CaseCreateDto dto) {
        return ResponseEntity.ok(adminService.createCase(dto));
    }

    @PutMapping("/cases/{id}")
    public ResponseEntity<CaseDto> updateCase(@PathVariable Long id,
                                               @RequestBody CaseCreateDto dto) {
        return ResponseEntity.ok(adminService.updateCase(id, dto));
    }

    @DeleteMapping("/cases/{id}")
    public ResponseEntity<?> deleteCase(@PathVariable Long id) {
        adminService.deleteCase(id);
        return ResponseEntity.ok("Case deleted successfully");
    }

    @PutMapping("/cases/{caseId}/assign-lawyer/{lawyerId}")
    public ResponseEntity<CaseDto> assignLawyer(@PathVariable Long caseId,
                                                 @PathVariable Long lawyerId) {
        return ResponseEntity.ok(adminService.assignLawyer(caseId, lawyerId));
    }
}