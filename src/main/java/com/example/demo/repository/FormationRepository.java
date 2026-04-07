package com.example.demo.repository;

import com.example.demo.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {

    List<Formation> findByAnnee(int annee);

    @Query("SELECT COALESCE(d.libelle, 'Non defini'), COUNT(f) FROM Formation f LEFT JOIN f.domaine d GROUP BY d.libelle")
    List<Object[]> countFormationsByDomaine();

    @Query("SELECT f.annee, COUNT(f) FROM Formation f GROUP BY f.annee ORDER BY f.annee")
    List<Object[]> countFormationsByAnnee();

    @Query("SELECT COALESCE(SUM(f.budget), 0) FROM Formation f")
    Double sumTotalBudget();
}
