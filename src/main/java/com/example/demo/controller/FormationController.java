package com.example.demo.controller;

import com.example.demo.entity.Formation;
import com.example.demo.service.FormationService;
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
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @GetMapping("/")
    public ResponseEntity<List<Formation>> getAllFormations() {
        return ResponseEntity.ok(formationService.getAllFormations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getFormationById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getFormationById(id));
    }

    @PostMapping("/")
    public ResponseEntity<Formation> createFormation(@Valid @RequestBody Formation formation) {
        Formation createdFormation = formationService.createFormation(formation);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFormation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formation> updateFormation(@PathVariable Long id, @Valid @RequestBody Formation formation) {
        return ResponseEntity.ok(formationService.updateFormation(id, formation));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFormation(@PathVariable Long id) {
        formationService.deleteFormation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/annee/{annee}")
    public ResponseEntity<List<Formation>> getFormationsByAnnee(@PathVariable int annee) {
        return ResponseEntity.ok(formationService.getFormationsByAnnee(annee));
    }
}
