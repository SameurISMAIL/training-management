package com.example.demo.service;

import com.example.demo.dto.AdminUtilisateurRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.Utilisateur;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur createUser(AdminUtilisateurRequest request) {
        Role role = roleRepository.findByNom(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role introuvable : " + request.getRole()));

        Utilisateur utilisateur = Utilisateur.builder()
                .login(request.getLogin())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        return utilisateurRepository.save(utilisateur);
    }

    public void deleteUser(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id));
        utilisateurRepository.delete(utilisateur);
    }
}
