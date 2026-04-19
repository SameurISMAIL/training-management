package com.example.demo.service;

import com.example.demo.entity.Domaine;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DomaineRepository;
import com.example.demo.repository.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DomaineService {

    private final DomaineRepository domaineRepository;
    private final FormationRepository formationRepository;

    public List<Domaine> getAllDomaines() {
        return domaineRepository.findAll();
    }

    public Domaine getDomaineById(Integer id) {
        return domaineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Domaine introuvable avec l'id " + id));
    }

    public Domaine createDomaine(Domaine domaine) {
        return domaineRepository.save(domaine);
    }

    public Domaine updateDomaine(Integer id, Domaine domaine) {
        Domaine existing = domaineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Domaine introuvable avec l'id " + id));

        existing.setLibelle(domaine.getLibelle());

        return domaineRepository.save(existing);
    }

    public void deleteDomaine(Integer id) {
        Domaine existing = domaineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Domaine introuvable avec l'id " + id));

        if (formationRepository.existsByDomaine_Id(id)) {
            throw new IllegalStateException("Impossible de supprimer ce domaine car il est deja utilise dans une ou plusieurs formations");
        }

        domaineRepository.delete(existing);
    }
}
