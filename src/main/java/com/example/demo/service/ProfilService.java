package com.example.demo.service;

import com.example.demo.entity.Profil;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.repository.ProfilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfilService {

    private final ProfilRepository profilRepository;
    private final ParticipantRepository participantRepository;

    public List<Profil> getAllProfils() {
        return profilRepository.findAll();
    }

    public Profil getProfilById(Integer id) {
        return profilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profil introuvable avec l'id " + id));
    }

    public Profil createProfil(Profil profil) {
        return profilRepository.save(profil);
    }

    public Profil updateProfil(Integer id, Profil profil) {
        Profil existing = profilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profil introuvable avec l'id " + id));

        existing.setLibelle(profil.getLibelle());

        return profilRepository.save(existing);
    }

    public void deleteProfil(Integer id) {
        Profil existing = profilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profil introuvable avec l'id " + id));

        if (participantRepository.existsByProfil_Id(id)) {
            throw new IllegalStateException("Ce profil est utilisé");
        }

        profilRepository.delete(existing);
    }
}
