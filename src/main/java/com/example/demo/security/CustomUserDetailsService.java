package com.example.demo.security;

import com.example.demo.entity.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable avec le login " + login));

        GrantedAuthority authority = new SimpleGrantedAuthority(mapToAuthority(utilisateur.getRole().getNom()));

        return new User(
                utilisateur.getLogin(),
                utilisateur.getPassword(),
                Collections.singletonList(authority)
        );
    }

    private String mapToAuthority(String roleName) {
        if (roleName == null) {
            return "ROLE_USER";
        }

        String normalized = roleName.trim().toLowerCase();

        return switch (normalized) {
            case "administrateur" -> "ROLE_ADMIN";
            case "responsable" -> "ROLE_RESPONSABLE";
            case "simple utilisateur" -> "ROLE_USER";
            default -> "ROLE_" + normalized.toUpperCase().replace(' ', '_');
        };
    }
}
