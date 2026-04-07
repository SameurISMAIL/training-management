package com.example.demo.controller;

import com.example.demo.entity.Structure;
import com.example.demo.service.StructureService;
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
@RequestMapping("/api/structures")
@RequiredArgsConstructor
public class StructureController {

    private final StructureService structureService;

    @GetMapping("/")
    public ResponseEntity<List<Structure>> getAllStructures() {
        return ResponseEntity.ok(structureService.getAllStructures());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Structure> getStructureById(@PathVariable Integer id) {
        return ResponseEntity.ok(structureService.getStructureById(id));
    }

    @PostMapping("/")
    public ResponseEntity<Structure> createStructure(@Valid @RequestBody Structure structure) {
        Structure created = structureService.createStructure(structure);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Structure> updateStructure(@PathVariable Integer id, @Valid @RequestBody Structure structure) {
        return ResponseEntity.ok(structureService.updateStructure(id, structure));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStructure(@PathVariable Integer id) {
        structureService.deleteStructure(id);
        return ResponseEntity.noContent().build();
    }
}
