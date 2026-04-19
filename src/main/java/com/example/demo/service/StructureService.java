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
        throw new IllegalStateException("Les structures sont fixes: seules 'Direction centrale' et 'Direction régionale' sont autorisees");
    }

    public Structure updateStructure(Integer id, Structure structure) {
        throw new IllegalStateException("La modification des structures est interdite: la liste est fixe");
    }

    public void deleteStructure(Integer id) {
        throw new IllegalStateException("La suppression des structures est interdite: la liste est fixe");
    }
}
