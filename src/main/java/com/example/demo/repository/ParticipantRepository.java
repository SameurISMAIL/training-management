package com.example.demo.repository;

import com.example.demo.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Integer> {

	boolean existsByProfil_Id(Integer profilId);
	boolean existsByStructure_Id(Integer structureId);

	@Query("SELECT COALESCE(s.libelle, 'Non definie'), COUNT(p) FROM Participant p LEFT JOIN p.structure s GROUP BY s.libelle")
	List<Object[]> countParticipantsByStructure();

	@Query("SELECT CONCAT(COALESCE(p.nom, 'Inconnu'), ' ', COALESCE(p.prenom, '')), COUNT(f) " +
			"FROM Formation f JOIN f.participants p " +
			"GROUP BY p.id, p.nom, p.prenom " +
			"HAVING COUNT(f) > 1 " +
			"ORDER BY COUNT(f) DESC")
	List<Object[]> mostActiveParticipants();
}
