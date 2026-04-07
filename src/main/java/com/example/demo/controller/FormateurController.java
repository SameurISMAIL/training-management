package com.example.demo.controller;

import com.example.demo.entity.Formateur;
import com.example.demo.service.FormateurService;
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
@RequestMapping("/api/formateurs")
@RequiredArgsConstructor
public class FormateurController {

    private final FormateurService formateurService;

    @GetMapping("/")
    public ResponseEntity<List<Formateur>> getAllFormateurs() {
        return ResponseEntity.ok(formateurService.getAllFormateurs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formateur> getFormateurById(@PathVariable Integer id) {
        return ResponseEntity.ok(formateurService.getFormateurById(id));
    }

    @PostMapping("/")
    public ResponseEntity<Formateur> createFormateur(@Valid @RequestBody Formateur formateur) {
        Formateur created = formateurService.createFormateur(formateur);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formateur> updateFormateur(@PathVariable Integer id, @Valid @RequestBody Formateur formateur) {
        return ResponseEntity.ok(formateurService.updateFormateur(id, formateur));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFormateur(@PathVariable Integer id) {
        formateurService.deleteFormateur(id);
        return ResponseEntity.noContent().build();
    }
}
