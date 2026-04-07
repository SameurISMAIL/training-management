package com.example.demo.service;

import com.example.demo.entity.Employeur;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.EmployeurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeurService {

    private final EmployeurRepository employeurRepository;

    public List<Employeur> getAllEmployeurs() {
        List<Employeur> employeurs = employeurRepository.findAll();
        if (employeurs.isEmpty()) {
            throw new ResourceNotFoundException("Aucun employeur trouve");
        }
        return employeurs;
    }

    public Employeur getEmployeurById(Integer id) {
        return employeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employeur introuvable avec l'id " + id));
    }

    public Employeur createEmployeur(Employeur employeur) {
        return employeurRepository.save(employeur);
    }

    public Employeur updateEmployeur(Integer id, Employeur employeur) {
        Employeur existing = employeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employeur introuvable avec l'id " + id));

        existing.setNomEmployeur(employeur.getNomEmployeur());

        return employeurRepository.save(existing);
    }

    public void deleteEmployeur(Integer id) {
        Employeur existing = employeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employeur introuvable avec l'id " + id));
        employeurRepository.delete(existing);
    }
}