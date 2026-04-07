package com.example.demo.controller;

import com.example.demo.entity.Domaine;
import com.example.demo.service.DomaineService;
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
@RequestMapping("/api/domaines")
@RequiredArgsConstructor
public class DomaineController {

    private final DomaineService domaineService;

    @GetMapping("/")
    public ResponseEntity<List<Domaine>> getAllDomaines() {
        return ResponseEntity.ok(domaineService.getAllDomaines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Domaine> getDomaineById(@PathVariable Integer id) {
        return ResponseEntity.ok(domaineService.getDomaineById(id));
    }

    @PostMapping("/")
    public ResponseEntity<Domaine> createDomaine(@Valid @RequestBody Domaine domaine) {
        Domaine created = domaineService.createDomaine(domaine);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Domaine> updateDomaine(@PathVariable Integer id, @Valid @RequestBody Domaine domaine) {
        return ResponseEntity.ok(domaineService.updateDomaine(id, domaine));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDomaine(@PathVariable Integer id) {
        domaineService.deleteDomaine(id);
        return ResponseEntity.noContent().build();
    }
}
