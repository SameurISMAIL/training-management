import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { Domaine } from '../../../core/models/domaine.model';
import { Formateur } from '../../../core/models/formateur.model';
import { Formation } from '../../../core/models/formation.model';
import { Participant } from '../../../core/models/participant.model';

export interface FormationDialogData {
  formation?: Formation;
  domaines: Domaine[];
  formateurs: Formateur[];
  participants: Participant[];
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-formation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './formation-dialog.component.html',
  styleUrl: './formation-dialog.component.css'
})
export class FormationDialogComponent implements OnInit {
  loading = false;

  form = this.fb.group({
    titre: ['', Validators.required],
    dateFormation: ['', Validators.required],
    duree: [null as number | null, [Validators.required, Validators.min(1)]],
    budget: [null as number | null, [Validators.required, Validators.min(0)]],
    idDomaine: [null as number | null, Validators.required],
    idFormateur: [null as number | null, Validators.required],
    participantIds: [[] as number[]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<FormationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: FormationDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.formation) {
      this.form.patchValue({
        titre: this.data.formation.titre,
        dateFormation: this.data.formation.dateFormation,
        duree: this.data.formation.duree,
        budget: this.data.formation.budget,
        idDomaine: this.data.formation.domaine?.id ?? null,
        idFormateur: this.data.formation.formateur?.id ?? null,
        participantIds: this.data.formation.participants?.map((p) => p.id) ?? []
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const participantIds = (value.participantIds ?? [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    const basePayload = {
      titre: value.titre ?? '',
      dateFormation: value.dateFormation as string,
      duree: value.duree as number,
      budget: value.budget as number,
      domaine: { id: Number(value.idDomaine), libelle: '' },
      formateur: { id: Number(value.idFormateur), nom: '', prenom: '', email: '', tel: 0, type: '', employeur: null },
      participants: participantIds.map((id) => ({
        id,
        nom: '',
        prenom: '',
        email: '',
        tel: 0,
        structure: null,
        profil: null
      }))
    };

    const payload: Formation = this.data.mode === 'edit' && this.data.formation
      ? ({ id: this.data.formation.id, ...basePayload } as Formation)
      : (basePayload as Formation);

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
