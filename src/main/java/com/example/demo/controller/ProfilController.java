package com.example.demo.controller;

import com.example.demo.entity.Profil;
import com.example.demo.service.ProfilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/profils")
@RequiredArgsConstructor
public class ProfilController {

    private final ProfilService profilService;

    @GetMapping("/")
    public ResponseEntity<List<Profil>> getAllProfils() {
        return ResponseEntity.ok(profilService.getAllProfils());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profil> getProfilById(@PathVariable Integer id) {
        return ResponseEntity.ok(profilService.getProfilById(id));
    }

    @PostMapping("/")
    public ResponseEntity<Profil> createProfil(@Valid @RequestBody Profil profil) {
        Profil created = profilService.createProfil(profil);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Profil> updateProfil(@PathVariable Integer id, @Valid @RequestBody Profil profil) {
        return ResponseEntity.ok(profilService.updateProfil(id, profil));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProfil(@PathVariable Integer id) {
        profilService.deleteProfil(id);
        return ResponseEntity.noContent().build();
    }
}
