package com.example.demo.controller;

import com.example.demo.entity.Employeur;
import com.example.demo.service.EmployeurService;
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
@RequestMapping("/api/employeurs")
@RequiredArgsConstructor
public class EmployeurController {

    private final EmployeurService employeurService;

    @GetMapping({"", "/"})
    public ResponseEntity<List<Employeur>> getAllEmployeurs() {
        return ResponseEntity.ok(employeurService.getAllEmployeurs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employeur> getEmployeurById(@PathVariable Integer id) {
        return ResponseEntity.ok(employeurService.getEmployeurById(id));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Employeur> createEmployeur(@Valid @RequestBody Employeur employeur) {
        Employeur created = employeurService.createEmployeur(employeur);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employeur> updateEmployeur(@PathVariable Integer id, @Valid @RequestBody Employeur employeur) {
        return ResponseEntity.ok(employeurService.updateEmployeur(id, employeur));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployeur(@PathVariable Integer id) {
        employeurService.deleteEmployeur(id);
        return ResponseEntity.noContent().build();
    }
}