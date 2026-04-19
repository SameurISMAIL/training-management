package com.example.demo.controller;

import com.example.demo.repository.FormationRepository;
import com.example.demo.repository.FormateurRepository;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.repository.StructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
public class StatistiqueController {

    private final FormationRepository formationRepository;
    private final ParticipantRepository participantRepository;
    private final FormateurRepository formateurRepository;
    private final StructureRepository structureRepository;

    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalFormations", formationRepository.count());
        result.put("totalParticipants", participantRepository.count());
        result.put("totalFormateurs", formateurRepository.count());
        result.put("totalStructures", structureRepository.count());
        result.put("budgetTotal", formationRepository.sumTotalBudget());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/annee/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByAnnee() {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByAnnee(), "annee", "count"));
    }

    @GetMapping("/annee/participants")
    public ResponseEntity<List<Map<String, Object>>> countParticipantsByAnnee() {
        return ResponseEntity.ok(mapStats(formationRepository.countParticipantsByAnnee(), "annee", "count"));
    }

    @GetMapping("/annee/budget")
    public ResponseEntity<List<Map<String, Object>>> sumBudgetByAnnee() {
        return ResponseEntity.ok(mapStats(formationRepository.sumBudgetByAnnee(), "annee", "budget"));
    }

    @GetMapping("/by-domaine")
    public ResponseEntity<List<Map<String, Object>>> countByDomaine() {
        return countFormationsByDomaine();
    }

    @GetMapping("/domaine/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByDomaine() {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByDomaine(), "domaine", "count"));
    }

    @GetMapping("/domaine/participants")
    public ResponseEntity<List<Map<String, Object>>> countParticipantsByDomaine() {
        return ResponseEntity.ok(mapStats(formationRepository.countParticipantsByDomaine(), "domaine", "count"));
    }

    @GetMapping("/by-structure")
    public ResponseEntity<List<Map<String, Object>>> countByStructure() {
        return countParticipantsByStructure();
    }

    @GetMapping("/structure/participants")
    public ResponseEntity<List<Map<String, Object>>> countParticipantsByStructure() {
        return ResponseEntity.ok(mapStats(participantRepository.countParticipantsByStructure(), "structure", "count"));
    }

    @GetMapping("/structure/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByStructure() {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByStructure(), "structure", "count"));
    }

    @GetMapping("/by-annee")
    public ResponseEntity<List<Map<String, Object>>> countByAnnee() {
        return countFormationsByAnnee();
    }

    @GetMapping("/formateurs/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByFormateur() {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByFormateur(), "formateur", "count"));
    }

    @GetMapping("/formateurs/repartition")
    public ResponseEntity<List<Map<String, Object>>> formateursRepartition() {
        return ResponseEntity.ok(mapStats(formateurRepository.countByType(), "type", "count"));
    }

    @GetMapping("/finances/domaine")
    public ResponseEntity<List<Map<String, Object>>> budgetByDomaine() {
        return ResponseEntity.ok(mapStats(formationRepository.sumBudgetByDomaine(), "domaine", "budget"));
    }

    @GetMapping("/finances/formation")
    public ResponseEntity<List<Map<String, Object>>> budgetByFormation() {
        return ResponseEntity.ok(mapStats(formationRepository.budgetByFormation(), "formation", "budget"));
    }

    @GetMapping("/mensuel/formations")
    public ResponseEntity<List<Map<String, Object>>> formationsByMois() {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByMois(), "mois", "count"));
    }

    @GetMapping("/avancees/top-formations")
    public ResponseEntity<List<Map<String, Object>>> topFormations() {
        List<Map<String, Object>> mapped = mapStats(formationRepository.topFormationsByParticipants(), "formation", "count");
        return ResponseEntity.ok(mapped.stream().limit(5).collect(Collectors.toList()));
    }

    @GetMapping("/avancees/moyenne-participants")
    public ResponseEntity<Map<String, Object>> averageParticipantsPerFormation() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("average", formationRepository.averageParticipantsPerFormation());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/avancees/participants-actifs")
    public ResponseEntity<List<Map<String, Object>>> mostActiveParticipants() {
        List<Map<String, Object>> mapped = mapStats(participantRepository.mostActiveParticipants(), "participant", "count");
        return ResponseEntity.ok(mapped.stream().limit(10).collect(Collectors.toList()));
    }

    @GetMapping("/budget-total")
    public ResponseEntity<Map<String, Object>> getTotalBudget() {
        Double total = formationRepository.sumTotalBudget();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("budgetTotal", total);
        return ResponseEntity.ok(result);
    }

    private List<Map<String, Object>> mapStats(List<Object[]> rows, String labelKey, String valueKey) {
        return rows.stream()
                .map(row -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put(labelKey, row[0]);
                    item.put(valueKey, row[1]);
                    return item;
                })
                .collect(Collectors.toList());
    }
}
