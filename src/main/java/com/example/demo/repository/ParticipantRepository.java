package com.example.demo.repository;

import com.example.demo.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Integer> {

	boolean existsByProfil_Id(Integer profilId);
	boolean existsByStructure_Id(Integer structureId);

	@Query("SELECT COALESCE(s.libelle, 'Non definie'), COUNT(DISTINCT p.id) FROM Formation f JOIN f.participants p LEFT JOIN p.structure s WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) GROUP BY s.libelle")
	List<Object[]> countParticipantsByStructure(@Param("annee") Integer annee);

	@Query("SELECT CONCAT(COALESCE(p.nom, 'Inconnu'), ' ', COALESCE(p.prenom, '')), COUNT(f) " +
			"FROM Formation f JOIN f.participants p " +
			"WHERE (:annee IS NULL OR YEAR(f.dateFormation) = :annee) " +
			"GROUP BY p.id, p.nom, p.prenom " +
			"HAVING COUNT(f) > 1 " +
			"ORDER BY COUNT(f) DESC")
	List<Object[]> mostActiveParticipants(@Param("annee") Integer annee);
}
