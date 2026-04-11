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

import { Employeur } from '../../../core/models/employeur.model';
import { Formateur } from '../../../core/models/formateur.model';
import { EmployeurService } from '../../../core/services/employeur.service';

export interface FormateurDialogData {
  formateur?: Formateur;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-formateur-dialog',
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
  templateUrl: './formateur-dialog.component.html',
  styleUrl: './formateur-dialog.component.css'
})
export class FormateurDialogComponent implements OnInit {
  loading = true;
  employeurs: Employeur[] = [];

  form = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', Validators.required],
    type: ['', Validators.required],
    idEmployeur: [null as number | null, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<FormateurDialogComponent>,
    private readonly employeurService: EmployeurService,
    @Inject(MAT_DIALOG_DATA) public readonly data: FormateurDialogData
  ) {}

  ngOnInit(): void {
    this.employeurService.getAll().subscribe({
      next: (employeurs) => {
        this.employeurs = employeurs;

        if (this.data.mode === 'edit' && this.data.formateur) {
          this.form.patchValue({
            nom: this.data.formateur.nom,
            prenom: this.data.formateur.prenom,
            email: this.data.formateur.email,
            tel: String(this.data.formateur.tel),
            type: this.data.formateur.type,
            idEmployeur: this.data.formateur.employeur?.id ?? null
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
    const payload: Formateur = {
      id: this.data.formateur?.id ?? 0,
      nom: value.nom ?? '',
      prenom: value.prenom ?? '',
      email: value.email ?? '',
      tel: Number(value.tel),
      type: value.type ?? '',
      employeur: { id: value.idEmployeur as number, nomEmployeur: '' }
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
