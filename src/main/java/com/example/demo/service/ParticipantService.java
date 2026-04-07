package com.example.demo.service;

import com.example.demo.entity.Participant;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    public List<Participant> getAllParticipants() {
        return participantRepository.findAll();
    }

    public Participant getParticipantById(Integer id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant introuvable avec l'id " + id));
    }

    public Participant createParticipant(Participant participant) {
        return participantRepository.save(participant);
    }

    public Participant updateParticipant(Integer id, Participant participant) {
        Participant existing = participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant introuvable avec l'id " + id));

        existing.setNom(participant.getNom());
        existing.setPrenom(participant.getPrenom());
        existing.setEmail(participant.getEmail());
        existing.setTel(participant.getTel());
        existing.setStructure(participant.getStructure());
        existing.setProfil(participant.getProfil());

        return participantRepository.save(existing);
    }

    public void deleteParticipant(Integer id) {
        Participant existing = participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant introuvable avec l'id " + id));
        participantRepository.delete(existing);
    }
}
