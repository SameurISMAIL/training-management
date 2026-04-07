package com.example.demo.dto;

import lombok.Data;

@Data
public class AdminUtilisateurRequest {

    private String login;
    private String password;
    private String role;
}
