package com.example.demo.service;

import com.example.demo.entity.Formation;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;

    public List<Formation> getAllFormations() {
        return formationRepository.findAll();
    }

    public Formation getFormationById(Long id) {
        return formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable avec l'id " + id));
    }

    public Formation createFormation(Formation f) {
        return formationRepository.save(f);
    }

    public Formation updateFormation(Long id, Formation f) {
        Formation existing = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable avec l'id " + id));

        existing.setTitre(f.getTitre());
        existing.setAnnee(f.getAnnee());
        existing.setDuree(f.getDuree());
        existing.setBudget(f.getBudget());
        existing.setDomaine(f.getDomaine());
        existing.setParticipants(f.getParticipants());
        existing.setFormateur(f.getFormateur());

        return formationRepository.save(existing);
    }

    public void deleteFormation(Long id) {
        Formation existing = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable avec l'id " + id));
        formationRepository.delete(existing);
    }

    public List<Formation> getFormationsByAnnee(int annee) {
        List<Formation> formations = formationRepository.findByAnnee(annee);
        if (formations.isEmpty()) {
            throw new ResourceNotFoundException("Aucune formation trouvee pour l'annee " + annee);
        }
        return formations;
    }
}
