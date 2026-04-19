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

    @Query("SELECT COALESCE(d.libelle, 'Non defini'), COUNT(DISTINCT p.id) FROM Formation f LEFT JOIN f.domaine d LEFT JOIN f.participants p GROUP BY d.libelle")
    List<Object[]> countParticipantsByDomaine();

    @Query("SELECT YEAR(f.dateFormation), COUNT(f) FROM Formation f WHERE f.dateFormation IS NOT NULL GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> countFormationsByAnnee();

    @Query("SELECT YEAR(f.dateFormation), COUNT(DISTINCT p.id) FROM Formation f LEFT JOIN f.participants p WHERE f.dateFormation IS NOT NULL GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> countParticipantsByAnnee();

    @Query("SELECT YEAR(f.dateFormation), COALESCE(SUM(f.budget), 0) FROM Formation f WHERE f.dateFormation IS NOT NULL GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> sumBudgetByAnnee();

    @Query("SELECT COALESCE(s.libelle, 'Non definie'), COUNT(DISTINCT f.id) FROM Formation f JOIN f.participants p LEFT JOIN p.structure s GROUP BY s.libelle")
    List<Object[]> countFormationsByStructure();

    @Query("SELECT CONCAT(COALESCE(fr.nom, 'Inconnu'), ' ', COALESCE(fr.prenom, '')), COUNT(f) FROM Formation f LEFT JOIN f.formateur fr GROUP BY fr.id, fr.nom, fr.prenom ORDER BY COUNT(f) DESC")
    List<Object[]> countFormationsByFormateur();

    @Query("SELECT COALESCE(d.libelle, 'Non defini'), COALESCE(SUM(f.budget), 0) FROM Formation f LEFT JOIN f.domaine d GROUP BY d.libelle")
    List<Object[]> sumBudgetByDomaine();

    @Query("SELECT f.titre, f.budget FROM Formation f ORDER BY f.budget DESC")
    List<Object[]> budgetByFormation();

    @Query("SELECT FUNCTION('date_format', f.dateFormation, '%Y-%m'), COUNT(f) FROM Formation f WHERE f.dateFormation IS NOT NULL GROUP BY FUNCTION('date_format', f.dateFormation, '%Y-%m') ORDER BY FUNCTION('date_format', f.dateFormation, '%Y-%m')")
    List<Object[]> countFormationsByMois();

    @Query("SELECT f.titre, COUNT(p) FROM Formation f LEFT JOIN f.participants p GROUP BY f.id, f.titre ORDER BY COUNT(p) DESC")
    List<Object[]> topFormationsByParticipants();

    @Query("SELECT COALESCE(AVG(SIZE(f.participants)), 0) FROM Formation f")
    Double averageParticipantsPerFormation();

    @Query("SELECT COALESCE(SUM(f.budget), 0) FROM Formation f")
    Double sumTotalBudget();
}
