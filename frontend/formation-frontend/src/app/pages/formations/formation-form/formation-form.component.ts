import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Domaine } from '../../../core/models/domaine.model';
import { Formateur } from '../../../core/models/formateur.model';
import { Formation } from '../../../core/models/formation.model';
import { Participant } from '../../../core/models/participant.model';
import { DomaineService } from '../../../core/services/domaine.service';
import { FormateurService } from '../../../core/services/formateur.service';
import { FormationService } from '../../../core/services/formation.service';
import { ParticipantService } from '../../../core/services/participant.service';

@Component({
  selector: 'app-formation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './formation-form.component.html',
  styleUrl: './formation-form.component.css'
})
export class FormationFormComponent implements OnInit {
  formationId: number | null = null;
  isEditMode = false;
  loading = true;
  saving = false;

  domaines: Domaine[] = [];
  formateurs: Formateur[] = [];
  participants: Participant[] = [];

  formationForm = this.fb.group({
    titre: ['', Validators.required],
    annee: [null as number | null, [Validators.required, Validators.min(2000), Validators.max(2100)]],
    duree: [null as number | null, [Validators.required, Validators.min(1)]],
    budget: [null as number | null, [Validators.required, Validators.min(0)]],
    idDomaine: [null as number | null, Validators.required],
    idFormateur: [null as number | null, Validators.required],
    participantIds: [[] as number[]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formationService: FormationService,
    private readonly domaineService: DomaineService,
    private readonly formateurService: FormateurService,
    private readonly participantService: ParticipantService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.formationId = idParam ? Number(idParam) : null;
      this.isEditMode = this.formationId !== null && !Number.isNaN(this.formationId);

      this.loadReferenceData();

      if (this.isEditMode && this.formationId !== null) {
        this.formationService.getFormationById(this.formationId).subscribe({
          next: (formation) => {
            this.patchForm(formation);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/formations']);
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  get titreControl() {
    return this.formationForm.controls.titre;
  }

  get anneeControl() {
    return this.formationForm.controls.annee;
  }

  get dureeControl() {
    return this.formationForm.controls.duree;
  }

  get budgetControl() {
    return this.formationForm.controls.budget;
  }

  get idDomaineControl() {
    return this.formationForm.controls.idDomaine;
  }

  get idFormateurControl() {
    return this.formationForm.controls.idFormateur;
  }

  loadReferenceData(): void {
    forkJoin({
      domaines: this.domaineService.getAllDomaines(),
      formateurs: this.formateurService.getAllFormateurs(),
      participants: this.participantService.getAllParticipants()
    }).subscribe({
      next: (result) => {
        this.domaines = result.domaines;
        this.formateurs = result.formateurs;
        this.participants = result.participants;
      }
    });
  }

  patchForm(formation: Formation): void {
    this.formationForm.patchValue({
      titre: formation.titre,
      annee: formation.annee,
      duree: formation.duree,
      budget: formation.budget,
      idDomaine: formation.domaine?.id ?? null,
      idFormateur: formation.formateur?.id ?? null,
      participantIds: formation.participants?.map((participant) => participant.id) ?? []
    });
  }

  onSubmit(): void {
    if (this.formationForm.invalid) {
      this.formationForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.formationForm.getRawValue();
    const payload: Formation = {
      id: this.formationId ?? 0,
      titre: formValue.titre ?? '',
      annee: formValue.annee as number,
      duree: formValue.duree as number,
      budget: formValue.budget as number,
      domaine: { id: formValue.idDomaine as number, libelle: '' },
      formateur: { id: formValue.idFormateur as number, nom: '', prenom: '', email: '', tel: 0, type: '', employeur: null },
      participants: (formValue.participantIds ?? []).map((participantId) => ({
        id: participantId,
        nom: '',
        prenom: '',
        email: '',
        tel: 0,
        structure: null,
        profil: null
      }))
    };

    const request$ = this.isEditMode && this.formationId !== null
      ? this.formationService.updateFormation(this.formationId, payload)
      : this.formationService.createFormation(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Formation enregistrée avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/formations']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Une erreur est survenue, veuillez réessayer', 'Fermer', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/formations']);
  }

}
