package com.example.demo.controller;

import com.example.demo.dto.AdminUtilisateurRequest;
import com.example.demo.entity.Utilisateur;
import com.example.demo.service.AdminUtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUtilisateurController {

    private final AdminUtilisateurService adminUtilisateurService;

    @GetMapping("/utilisateurs")
    public ResponseEntity<List<Utilisateur>> getAllUsers() {
        return ResponseEntity.ok(adminUtilisateurService.getAllUsers());
    }

    @PostMapping("/utilisateurs")
    public ResponseEntity<Utilisateur> createUser(@Valid @RequestBody AdminUtilisateurRequest request) {
        if (request.getRole() != null) {
            request.setRole(request.getRole().trim().toLowerCase());
        }
        Utilisateur createdUser = adminUtilisateurService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUtilisateurService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
