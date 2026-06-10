package com.lab.assistant.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "E-posta alanı boş olamaz")
    @Email(message = "Geçersiz e-posta formatı")
    private String email;

    @NotBlank(message = "Şifre alanı boş olamaz")
    private String password; // RSA encrypted password (Base64 string)
}
