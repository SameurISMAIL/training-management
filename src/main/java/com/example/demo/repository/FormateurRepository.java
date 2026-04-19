package com.example.demo.repository;

import com.example.demo.entity.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormateurRepository extends JpaRepository<Formateur, Integer> {
	boolean existsByEmployeur_Id(Integer employeurId);
}
