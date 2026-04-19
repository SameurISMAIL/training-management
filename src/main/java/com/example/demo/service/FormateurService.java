package com.example.demo.service;

import com.example.demo.entity.Formateur;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FormationRepository;
import com.example.demo.repository.FormateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormateurService {

    private final FormateurRepository formateurRepository;
    private final FormationRepository formationRepository;

    public List<Formateur> getAllFormateurs() {
        return formateurRepository.findAll();
    }

    public Formateur getFormateurById(Integer id) {
        return formateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formateur introuvable avec l'id " + id));
    }

    public Formateur createFormateur(Formateur formateur) {
        return formateurRepository.save(formateur);
    }

    public Formateur updateFormateur(Integer id, Formateur formateur) {
        Formateur existing = formateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formateur introuvable avec l'id " + id));

        existing.setNom(formateur.getNom());
        existing.setPrenom(formateur.getPrenom());
        existing.setEmail(formateur.getEmail());
        existing.setTel(formateur.getTel());
        existing.setType(formateur.getType());
        existing.setEmployeur(formateur.getEmployeur());

        return formateurRepository.save(existing);
    }

    public void deleteFormateur(Integer id) {
        Formateur existing = formateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formateur introuvable avec l'id " + id));

        if (formationRepository.existsByFormateur_Id(id)) {
            throw new IllegalStateException("Impossible de supprimer ce formateur car il est deja utilise dans une ou plusieurs formations");
        }

        formateurRepository.delete(existing);
    }
}
