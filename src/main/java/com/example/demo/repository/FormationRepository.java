package com.example.demo.repository;

import com.example.demo.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {

    List<Formation> findByDateFormationBetween(LocalDate start, LocalDate end);
    boolean existsByFormateur_Id(Integer formateurId);
    boolean existsByDomaine_Id(Integer domaineId);
    boolean existsByParticipants_Id(Integer participantId);

    @Query("SELECT COALESCE(d.libelle, 'Non defini'), COUNT(f) FROM Formation f LEFT JOIN f.domaine d GROUP BY d.libelle")
    List<Object[]> countFormationsByDomaine();

    @Query("SELECT YEAR(f.dateFormation), COUNT(f) FROM Formation f WHERE f.dateFormation IS NOT NULL GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> countFormationsByAnnee();

    @Query("SELECT COALESCE(SUM(f.budget), 0) FROM Formation f")
    Double sumTotalBudget();
}
