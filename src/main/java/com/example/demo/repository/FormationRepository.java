package com.example.demo.repository;

import com.example.demo.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {

    List<Formation> findByDateFormationBetween(LocalDate start, LocalDate end);
    boolean existsByFormateur_Id(Integer formateurId);
    boolean existsByDomaine_Id(Integer domaineId);
    boolean existsByParticipants_Id(Integer participantId);

    @Query("SELECT COALESCE(d.libelle, 'Non defini'), COUNT(f) FROM Formation f LEFT JOIN f.domaine d WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY d.libelle")
    List<Object[]> countFormationsByDomaine(@Param("annee") Integer annee);

    @Query("SELECT COALESCE(d.libelle, 'Non defini'), COUNT(DISTINCT p.id) FROM Formation f LEFT JOIN f.domaine d LEFT JOIN f.participants p WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY d.libelle")
    List<Object[]> countParticipantsByDomaine(@Param("annee") Integer annee);

    @Query("SELECT YEAR(f.dateFormation), COUNT(f) FROM Formation f WHERE f.dateFormation IS NOT NULL AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> countFormationsByAnnee(@Param("annee") Integer annee);

    @Query("SELECT YEAR(f.dateFormation), COUNT(DISTINCT p.id) FROM Formation f LEFT JOIN f.participants p WHERE f.dateFormation IS NOT NULL AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> countParticipantsByAnnee(@Param("annee") Integer annee);

    @Query("SELECT YEAR(f.dateFormation), COUNT(DISTINCT fr.id) FROM Formation f LEFT JOIN f.formateur fr WHERE f.dateFormation IS NOT NULL AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> countFormateursByAnnee(@Param("annee") Integer annee);

    @Query("SELECT YEAR(f.dateFormation), COALESCE(SUM(f.budget), 0) FROM Formation f WHERE f.dateFormation IS NOT NULL AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY YEAR(f.dateFormation) ORDER BY YEAR(f.dateFormation)")
    List<Object[]> sumBudgetByAnnee(@Param("annee") Integer annee);

    @Query("SELECT COALESCE(s.libelle, 'Non definie'), COUNT(DISTINCT f.id) FROM Formation f JOIN f.participants p LEFT JOIN p.structure s WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY s.libelle")
    List<Object[]> countFormationsByStructure(@Param("annee") Integer annee);

    @Query("SELECT CONCAT(COALESCE(fr.nom, 'Inconnu'), ' ', COALESCE(fr.prenom, '')), COUNT(f) FROM Formation f LEFT JOIN f.formateur fr WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY fr.id, fr.nom, fr.prenom ORDER BY COUNT(f) DESC")
    List<Object[]> countFormationsByFormateur(@Param("annee") Integer annee);

    @Query("SELECT COALESCE(d.libelle, 'Non defini'), COALESCE(SUM(f.budget), 0) FROM Formation f LEFT JOIN f.domaine d WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY d.libelle")
    List<Object[]> sumBudgetByDomaine(@Param("annee") Integer annee);

    @Query("SELECT f.titre, f.budget FROM Formation f WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) ORDER BY f.budget DESC")
    List<Object[]> budgetByFormation(@Param("annee") Integer annee);

    @Query("SELECT FUNCTION('date_format', f.dateFormation, '%Y-%m'), COUNT(f) FROM Formation f WHERE f.dateFormation IS NOT NULL AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY FUNCTION('date_format', f.dateFormation, '%Y-%m') ORDER BY FUNCTION('date_format', f.dateFormation, '%Y-%m')")
    List<Object[]> countFormationsByMois(@Param("annee") Integer annee);

    @Query("SELECT f.titre, COUNT(p) FROM Formation f LEFT JOIN f.participants p WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY f.id, f.titre ORDER BY COUNT(p) DESC")
    List<Object[]> topFormationsByParticipants(@Param("annee") Integer annee);

    @Query("SELECT COALESCE(AVG(SIZE(f.participants)), 0) FROM Formation f WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee)")
    Double averageParticipantsPerFormation(@Param("annee") Integer annee);

    @Query("SELECT COALESCE(SUM(f.budget), 0) FROM Formation f WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee)")
    Double sumTotalBudget(@Param("annee") Integer annee);

    @Query("SELECT YEAR(f.dateFormation), CONCAT(COALESCE(fr.nom, 'Inconnu'), ' ', COALESCE(fr.prenom, '')), COUNT(f) FROM Formation f LEFT JOIN f.formateur fr WHERE f.dateFormation IS NOT NULL AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY YEAR(f.dateFormation), fr.id, fr.nom, fr.prenom ORDER BY YEAR(f.dateFormation), COUNT(f) DESC")
    List<Object[]> topFormateursByAnnee(@Param("annee") Integer annee);

    @Query("SELECT f.titre, COUNT(p) FROM Formation f LEFT JOIN f.participants p LEFT JOIN f.formateur fr WHERE fr.type = 'interne' AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY f.id, f.titre ORDER BY COUNT(p) DESC")
    List<Object[]> topFormationsByFormateurInterne(@Param("annee") Integer annee);

    @Query("SELECT f.titre, COUNT(p) FROM Formation f LEFT JOIN f.participants p LEFT JOIN f.formateur fr WHERE fr.type = 'externe' AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY f.id, f.titre ORDER BY COUNT(p) DESC")
    List<Object[]> topFormationsByFormateurExterne(@Param("annee") Integer annee);

    @Query("SELECT CONCAT(COALESCE(fr.nom, 'Inconnu'), ' ', COALESCE(fr.prenom, '')), COUNT(f) FROM Formation f LEFT JOIN f.formateur fr WHERE fr.type = 'interne' AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY fr.id, fr.nom, fr.prenom ORDER BY COUNT(f) DESC")
    List<Object[]> topFormateursInternes(@Param("annee") Integer annee);

    @Query("SELECT CONCAT(COALESCE(fr.nom, 'Inconnu'), ' ', COALESCE(fr.prenom, '')), COUNT(f) FROM Formation f LEFT JOIN f.formateur fr WHERE fr.type = 'externe' AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY fr.id, fr.nom, fr.prenom ORDER BY COUNT(f) DESC")
    List<Object[]> topFormateursExternes(@Param("annee") Integer annee);

    @Query("SELECT LOWER(COALESCE(fr.type, 'inconnu')), COUNT(DISTINCT fr.id) FROM Formation f LEFT JOIN f.formateur fr WHERE fr IS NOT NULL AND (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY LOWER(COALESCE(fr.type, 'inconnu'))")
    List<Object[]> countFormateursRepartitionByType(@Param("annee") Integer annee);
}
