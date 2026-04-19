package com.example.demo.service;

import com.example.demo.entity.Formation;
import com.example.demo.entity.Participant;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DomaineRepository;
import com.example.demo.repository.FormateurRepository;
import com.example.demo.repository.FormationRepository;
import com.example.demo.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final DomaineRepository domaineRepository;
    private final FormateurRepository formateurRepository;
    private final ParticipantRepository participantRepository;

    public List<Formation> getAllFormations() {
        return formationRepository.findAll();
    }

    public Formation getFormationById(Long id) {
        return formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable avec l'id " + id));
    }

    public Formation createFormation(Formation f) {
        validateDateFormation(f);
        hydrateRelations(f);
        return formationRepository.save(f);
    }

    public Formation updateFormation(Long id, Formation f) {
        Formation existing = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable avec l'id " + id));

        existing.setTitre(f.getTitre());
        existing.setDateFormation(f.getDateFormation());
        existing.setDuree(f.getDuree());
        existing.setBudget(f.getBudget());

        validateDateFormation(f);
        // Resolve relation IDs to managed entities to avoid transient entity errors.
        hydrateRelations(f);
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
        LocalDate start = LocalDate.of(annee, 1, 1);
        LocalDate end = LocalDate.of(annee, 12, 31);
        List<Formation> formations = formationRepository.findByDateFormationBetween(start, end);
        if (formations.isEmpty()) {
            throw new ResourceNotFoundException("Aucune formation trouvee pour l'annee " + annee);
        }
        return formations;
    }

    private void validateDateFormation(Formation f) {
        if (f.getDateFormation() == null) {
            throw new ResourceNotFoundException("La date de formation est obligatoire");
        }
    }

    private void hydrateRelations(Formation f) {
        if (f.getDomaine() == null || f.getDomaine().getId() <= 0) {
            throw new ResourceNotFoundException("Domaine invalide");
        }
        if (f.getFormateur() == null || f.getFormateur().getId() <= 0) {
            throw new ResourceNotFoundException("Formateur invalide");
        }

        int domaineId = f.getDomaine().getId();
        int formateurId = f.getFormateur().getId();

        f.setDomaine(domaineRepository.findById(domaineId)
                .orElseThrow(() -> new ResourceNotFoundException("Domaine introuvable avec l'id " + domaineId)));
        f.setFormateur(formateurRepository.findById(formateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Formateur introuvable avec l'id " + formateurId)));

        Set<Participant> resolvedParticipants = new HashSet<>();
        if (f.getParticipants() != null) {
            for (Participant participant : f.getParticipants()) {
                int participantId = participant.getId();
                Participant managedParticipant = participantRepository.findById(participantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Participant introuvable avec l'id " + participantId));
                resolvedParticipants.add(managedParticipant);
            }
        }
        f.setParticipants(resolvedParticipants);
    }
}
