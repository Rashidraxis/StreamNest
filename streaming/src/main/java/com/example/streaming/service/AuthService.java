package com.example.streaming.service;

import com.example.streaming.dto.AuthResponseDTO;
import com.example.streaming.dto.LoginRequestDTO;
import com.example.streaming.dto.RegisterRequestDTO;
import com.example.streaming.enums.Role;
import com.example.streaming.model.User;
import com.example.streaming.repository.UserRepository;
import com.example.streaming.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                      JwtService jwtService,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        // check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // create new user
        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),  // hash password
                Role.USER  // default role
        );

        userRepository.save(user);

        // generate JWT token
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponseDTO(token, user.getName(), user.getRole().name());
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        // find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // generate JWT token
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponseDTO(token, user.getName(), user.getRole().name());
    }
}