package com.example.demo.service;

import com.example.demo.entity.Structure;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.StructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StructureService {

    private final StructureRepository structureRepository;

    public List<Structure> getAllStructures() {
        return structureRepository.findAll();
    }

    public Structure getStructureById(Integer id) {
        return structureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Structure introuvable avec l'id " + id));
    }

    public Structure createStructure(Structure structure) {
        return structureRepository.save(structure);
    }

    public Structure updateStructure(Integer id, Structure structure) {
        Structure existing = structureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Structure introuvable avec l'id " + id));

        existing.setLibelle(structure.getLibelle());

        return structureRepository.save(existing);
    }

    public void deleteStructure(Integer id) {
        Structure existing = structureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Structure introuvable avec l'id " + id));
        structureRepository.delete(existing);
    }
}
