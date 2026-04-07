package com.example.demo.config;

import com.example.demo.entity.Role;
import com.example.demo.entity.Utilisateur;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public void run(String... args) {
        if (roleRepository.count() == 0) {
            Role administrateur = roleRepository.save(Role.builder().id(1).nom("administrateur").build());
            Role responsable = Role.builder().id(2).nom("responsable").build();
            Role simpleUtilisateur = Role.builder().id(3).nom("simple utilisateur").build();

            roleRepository.saveAll(List.of(responsable, simpleUtilisateur));

            Utilisateur admin = Utilisateur.builder()
                    .login("admin")
                    .password(new BCryptPasswordEncoder().encode("admin123"))
                    .role(administrateur)
                    .build();

            utilisateurRepository.save(admin);
        }
    }
}