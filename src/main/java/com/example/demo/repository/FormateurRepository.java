package com.example.demo.repository;

import com.example.demo.entity.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FormateurRepository extends JpaRepository<Formateur, Integer> {
	boolean existsByEmployeur_Id(Integer employeurId);

	@Query("SELECT LOWER(COALESCE(f.type, 'inconnu')), COUNT(f) FROM Formateur f GROUP BY LOWER(COALESCE(f.type, 'inconnu'))")
	List<Object[]> countByType();
}
