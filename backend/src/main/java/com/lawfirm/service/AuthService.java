package com.lawfirm.service;

import com.lawfirm.dto.AuthResponse;
import com.lawfirm.dto.LoginRequest;
import com.lawfirm.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse register(RegisterRequest registerRequest);
    boolean validateToken(String token);
}
