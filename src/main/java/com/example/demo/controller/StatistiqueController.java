package com.example.demo.controller;

import com.example.demo.repository.FormationRepository;
import com.example.demo.repository.FormateurRepository;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.repository.StructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Comparator;
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
    public ResponseEntity<Map<String, Object>> getGlobalStats(@RequestParam(required = false) Integer annee) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (annee == null) {
            result.put("totalFormations", formationRepository.count());
            result.put("totalParticipants", participantRepository.count());
            result.put("totalFormateurs", formateurRepository.count());
            result.put("totalStructures", structureRepository.count());
            result.put("budgetTotal", formationRepository.sumTotalBudget(null));
        } else {
            result.put("totalFormations", formationRepository.countFormationsByAnnee(annee).stream().mapToLong(row -> ((Number) row[1]).longValue()).sum());
            result.put("totalParticipants", formationRepository.countParticipantsByAnnee(annee).stream().mapToLong(row -> ((Number) row[1]).longValue()).sum());
            result.put("totalFormateurs", formationRepository.countFormateursByAnnee(annee).stream().mapToLong(row -> ((Number) row[1]).longValue()).sum());
            result.put("totalStructures", participantRepository.countParticipantsByStructure(annee).size());
            result.put("budgetTotal", formationRepository.sumTotalBudget(annee));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/annee/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByAnnee(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByAnnee(annee), "annee", "count"));
    }

    @GetMapping("/annee/participants")
    public ResponseEntity<List<Map<String, Object>>> countParticipantsByAnnee(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countParticipantsByAnnee(annee), "annee", "count"));
    }

    @GetMapping("/annee/formateurs")
    public ResponseEntity<List<Map<String, Object>>> countFormateursByAnnee(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countFormateursByAnnee(annee), "annee", "count"));
    }

    @GetMapping("/annee/budget")
    public ResponseEntity<List<Map<String, Object>>> sumBudgetByAnnee(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.sumBudgetByAnnee(annee), "annee", "budget"));
    }

    @GetMapping("/by-domaine")
    public ResponseEntity<List<Map<String, Object>>> countByDomaine() {
        return countFormationsByDomaine(null);   // FIXED: pass null for all years
    }

    @GetMapping("/domaine/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByDomaine(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByDomaine(annee), "domaine", "count"));
    }

    @GetMapping("/domaine/participants")
    public ResponseEntity<List<Map<String, Object>>> countParticipantsByDomaine(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countParticipantsByDomaine(annee), "domaine", "count"));
    }

    @GetMapping("/by-structure")
    public ResponseEntity<List<Map<String, Object>>> countByStructure() {
        return countParticipantsByStructure(null);   // FIXED: pass null for all years
    }

    @GetMapping("/structure/participants")
    public ResponseEntity<List<Map<String, Object>>> countParticipantsByStructure(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(participantRepository.countParticipantsByStructure(annee), "structure", "count"));
    }

    @GetMapping("/structure/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByStructure(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByStructure(annee), "structure", "count"));
    }

    @GetMapping("/by-annee")
    public ResponseEntity<List<Map<String, Object>>> countByAnnee() {
        return countFormationsByAnnee(null);   // FIXED: pass null for all years
    }

    @GetMapping("/formateurs/formations")
    public ResponseEntity<List<Map<String, Object>>> countFormationsByFormateur(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByFormateur(annee), "formateur", "count"));
    }

    @GetMapping("/formateurs/repartition")
    public ResponseEntity<List<Map<String, Object>>> formateursRepartition(@RequestParam(required = false) Integer annee) {
        if (annee == null) {
            return ResponseEntity.ok(mapStats(formateurRepository.countByType(), "type", "count"));
        }

        return ResponseEntity.ok(mapStats(formationRepository.countFormateursRepartitionByType(annee), "type", "count"));
    }

    @GetMapping("/finances/domaine")
    public ResponseEntity<List<Map<String, Object>>> budgetByDomaine(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.sumBudgetByDomaine(annee), "domaine", "budget"));
    }

    @GetMapping("/finances/formation")
    public ResponseEntity<List<Map<String, Object>>> budgetByFormation(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.budgetByFormation(annee), "formation", "budget"));
    }

    @GetMapping("/mensuel/formations")
    public ResponseEntity<List<Map<String, Object>>> formationsByMois(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(mapStats(formationRepository.countFormationsByMois(annee), "mois", "count"));
    }

    @GetMapping("/avancees/top-formations")
    public ResponseEntity<List<Map<String, Object>>> topFormations(@RequestParam(required = false) Integer annee) {
        List<Map<String, Object>> mapped = mapStats(formationRepository.topFormationsByParticipants(annee), "formation", "count");
        return ResponseEntity.ok(mapped.stream().limit(5).collect(Collectors.toList()));
    }

    @GetMapping("/avancees/moyenne-participants")
    public ResponseEntity<Map<String, Object>> averageParticipantsPerFormation(@RequestParam(required = false) Integer annee) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("average", formationRepository.averageParticipantsPerFormation(annee));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/avancees/participants-actifs")
    public ResponseEntity<List<Map<String, Object>>> mostActiveParticipants(@RequestParam(required = false) Integer annee) {
        List<Map<String, Object>> mapped = mapStats(participantRepository.mostActiveParticipants(annee), "participant", "count");
        return ResponseEntity.ok(mapped.stream().limit(10).collect(Collectors.toList()));
    }

    @GetMapping("/avancees/top-formateurs")
    public ResponseEntity<Map<Integer, List<Map<String, Object>>>> topFormateursByAnnee(@RequestParam(required = false) Integer annee) {
        Map<Integer, Map<String, Long>> countsByYear = new LinkedHashMap<>();

        formationRepository.findAll().stream()
                .filter(f -> f.getDateFormation() != null)
                .filter(f -> annee == null || f.getDateFormation().getYear() == annee)
                .forEach(f -> {
                    int year = f.getDateFormation().getYear();
                    String formateurName = f.getFormateur() != null
                            ? (String.valueOf(f.getFormateur().getNom() == null ? "Inconnu" : f.getFormateur().getNom()) + " " +
                               String.valueOf(f.getFormateur().getPrenom() == null ? "" : f.getFormateur().getPrenom())).trim()
                            : "Inconnu";

                    countsByYear.computeIfAbsent(year, key -> new LinkedHashMap<>());
                    Map<String, Long> yearCounts = countsByYear.get(year);
                    yearCounts.put(formateurName, yearCounts.getOrDefault(formateurName, 0L) + 1L);
                });

        Map<Integer, List<Map<String, Object>>> grouped = countsByYear.entrySet().stream()
                .sorted(Map.Entry.<Integer, Map<String, Long>>comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().entrySet().stream()
                                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                                .limit(10)
                                .map(e -> {
                                    Map<String, Object> item = new LinkedHashMap<>();
                                    item.put("formateur", e.getKey());
                                    item.put("count", e.getValue());
                                    return item;
                                })
                                .collect(Collectors.toList()),
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        return ResponseEntity.ok(grouped);
    }

    @GetMapping("/formations/interne")
    public ResponseEntity<List<Map<String, Object>>> topFormationsInternes(@RequestParam(required = false) Integer annee) {
        List<Map<String, Object>> mapped = mapStats(formationRepository.topFormationsByFormateurInterne(annee), "formation", "count");
        return ResponseEntity.ok(mapped.stream().limit(10).collect(Collectors.toList()));
    }

    @GetMapping("/formations/externe")
    public ResponseEntity<List<Map<String, Object>>> topFormationsExternes(@RequestParam(required = false) Integer annee) {
        List<Map<String, Object>> mapped = mapStats(formationRepository.topFormationsByFormateurExterne(annee), "formation", "count");
        return ResponseEntity.ok(mapped.stream().limit(10).collect(Collectors.toList()));
    }

    @GetMapping("/formateurs/top-internes")
    public ResponseEntity<List<Map<String, Object>>> topFormateursInternes(@RequestParam(required = false) Integer annee) {
        List<Map<String, Object>> mapped = mapStats(formationRepository.topFormateursInternes(annee), "formateur", "count");
        return ResponseEntity.ok(mapped.stream().limit(5).collect(Collectors.toList()));
    }

    @GetMapping("/formateurs/top-externes")
    public ResponseEntity<List<Map<String, Object>>> topFormateursExternes(@RequestParam(required = false) Integer annee) {
        List<Map<String, Object>> mapped = mapStats(formationRepository.topFormateursExternes(annee), "formateur", "count");
        return ResponseEntity.ok(mapped.stream().limit(5).collect(Collectors.toList()));
    }

    @GetMapping("/budget-total")
    public ResponseEntity<Map<String, Object>> getTotalBudget(@RequestParam(required = false) Integer annee) {
        Double total = formationRepository.sumTotalBudget(annee);
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