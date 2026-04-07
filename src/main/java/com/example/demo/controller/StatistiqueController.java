package com.example.demo.controller;

import com.example.demo.repository.FormationRepository;
import com.example.demo.repository.ParticipantRepository;
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

    @GetMapping("/by-domaine")
    public ResponseEntity<List<Map<String, Object>>> countByDomaine() {
        List<Map<String, Object>> result = formationRepository.countFormationsByDomaine().stream()
                .map(row -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("domaine", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-structure")
    public ResponseEntity<List<Map<String, Object>>> countByStructure() {
        List<Map<String, Object>> result = participantRepository.countParticipantsByStructure().stream()
                .map(row -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("structure", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-annee")
    public ResponseEntity<List<Map<String, Object>>> countByAnnee() {
        List<Map<String, Object>> result = formationRepository.countFormationsByAnnee().stream()
                .map(row -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("annee", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/budget-total")
    public ResponseEntity<Map<String, Object>> getTotalBudget() {
        Double total = formationRepository.sumTotalBudget();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("budgetTotal", total);
        return ResponseEntity.ok(result);
    }
}
