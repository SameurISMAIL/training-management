import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Participant } from '../../../core/models/participant.model';
import { Structure } from '../../../core/models/structure.model';
import { Profil } from '../../../core/models/profil.model';
import { ParticipantService } from '../../../core/services/participant.service';
import { StructureService } from '../../../core/services/structure.service';
import { ProfilService } from '../../../core/services/profil.service';

@Component({
  selector: 'app-participant-form',
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
  templateUrl: './participant-form.component.html',
  styleUrl: './participant-form.component.css'
})
export class ParticipantFormComponent implements OnInit {
  participantId: number | null = null;
  isEditMode = false;
  loading = true;
  saving = false;

  structures: Structure[] = [];
  profils: Profil[] = [];

  participantForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', Validators.required],
    idStructure: [null as number | null, Validators.required],
    idProfil: [null as number | null, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly participantService: ParticipantService,
    private readonly structureService: StructureService,
    private readonly profilService: ProfilService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.participantId = idParam ? Number(idParam) : null;
      this.isEditMode = this.participantId !== null && !Number.isNaN(this.participantId);

      const participant$ = this.isEditMode && this.participantId !== null
        ? this.participantService.getById(this.participantId)
        : of(null);

      forkJoin({
        structures: this.structureService.getAll(),
        profils: this.profilService.getAll(),
        participant: participant$
      }).subscribe({
        next: (result) => {
          this.structures = result.structures;
          this.profils = result.profils;

          if (result.participant) {
            this.patchForm(result.participant);
          }

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/participants']);
        }
      });
    });
  }

  get nomControl() {
    return this.participantForm.controls.nom;
  }

  get prenomControl() {
    return this.participantForm.controls.prenom;
  }

  get emailControl() {
    return this.participantForm.controls.email;
  }

  get telControl() {
    return this.participantForm.controls.tel;
  }

  get idStructureControl() {
    return this.participantForm.controls.idStructure;
  }

  get idProfilControl() {
    return this.participantForm.controls.idProfil;
  }

  patchForm(participant: Participant): void {
    this.participantForm.patchValue({
      nom: participant.nom,
      prenom: participant.prenom,
      email: participant.email,
      tel: String(participant.tel),
      idStructure: participant.structure?.id ?? null,
      idProfil: participant.profil?.id ?? null
    });
  }

  onSubmit(): void {
    if (this.participantForm.invalid) {
      this.participantForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.participantForm.getRawValue();
    const payload: Participant = {
      id: this.participantId ?? 0,
      nom: formValue.nom ?? '',
      prenom: formValue.prenom ?? '',
      email: formValue.email ?? '',
      tel: Number(formValue.tel),
      structure: {
        id: formValue.idStructure as number,
        libelle: ''
      },
      profil: {
        id: formValue.idProfil as number,
        libelle: ''
      }
    };

    const request$ = this.isEditMode && this.participantId !== null
      ? this.participantService.update(this.participantId, payload)
      : this.participantService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Participant enregistré avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/participants']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Une erreur est survenue, veuillez réessayer', 'Fermer', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/participants']);
  }
}
