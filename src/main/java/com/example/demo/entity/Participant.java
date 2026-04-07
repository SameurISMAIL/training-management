package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name = "participants")
@Data
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @Email
    private String email;

    private int tel;

    @ManyToOne
    @JoinColumn(name = "structure_id")
    private Structure structure;

    @ManyToOne
    @JoinColumn(name = "profil_id")
    private Profil profil;
}
