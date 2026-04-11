import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { Participant } from '../../../core/models/participant.model';
import { Profil } from '../../../core/models/profil.model';
import { Structure } from '../../../core/models/structure.model';
import { ProfilService } from '../../../core/services/profil.service';
import { StructureService } from '../../../core/services/structure.service';

export interface ParticipantDialogData {
  participant?: Participant;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-participant-dialog',
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
  templateUrl: './participant-dialog.component.html',
  styleUrl: './participant-dialog.component.css'
})
export class ParticipantDialogComponent implements OnInit {
  loading = true;
  structures: Structure[] = [];
  profils: Profil[] = [];

  form = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', Validators.required],
    idStructure: [null as number | null, Validators.required],
    idProfil: [null as number | null, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ParticipantDialogComponent>,
    private readonly structureService: StructureService,
    private readonly profilService: ProfilService,
    @Inject(MAT_DIALOG_DATA) public readonly data: ParticipantDialogData
  ) {}

  ngOnInit(): void {
    forkJoin({
      structures: this.structureService.getAll(),
      profils: this.profilService.getAll()
    }).subscribe({
      next: ({ structures, profils }) => {
        this.structures = structures;
        this.profils = profils;

        if (this.data.mode === 'edit' && this.data.participant) {
          this.form.patchValue({
            nom: this.data.participant.nom,
            prenom: this.data.participant.prenom,
            email: this.data.participant.email,
            tel: String(this.data.participant.tel),
            idStructure: this.data.participant.structure?.id ?? null,
            idProfil: this.data.participant.profil?.id ?? null
          });
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: Participant = {
      id: this.data.participant?.id ?? 0,
      nom: value.nom ?? '',
      prenom: value.prenom ?? '',
      email: value.email ?? '',
      tel: Number(value.tel),
      structure: { id: value.idStructure as number, libelle: '' },
      profil: { id: value.idProfil as number, libelle: '' }
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
