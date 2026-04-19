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
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './formateur-dialog.component.html',
  styleUrl: './formateur-dialog.component.css'
})
export class FormateurDialogComponent implements OnInit {
  loading = true;
  employeurs: Employeur[] = [];
  creatingEmployeur = false;
  employeurLoading = false;

  form = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', Validators.required],
    type: ['', Validators.required],
    idEmployeur: [null as number | null],
    nomEmployeur: ['']
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
            type: this.data.formateur.type?.toLowerCase(),
            idEmployeur: this.data.formateur.employeur?.id ?? null
          });
        }

        this.bindTypeRules();
        this.syncEmployeurValidators(this.form.controls.type.value);

        this.loading = false;
      },
      error: () => {
        this.bindTypeRules();
        this.syncEmployeurValidators(this.form.controls.type.value);
        this.loading = false;
      }
    });
  }

  get isExterne(): boolean {
    return (this.form.controls.type.value ?? '').toLowerCase() === 'externe';
  }

  toggleCreateEmployeur(): void {
    this.creatingEmployeur = !this.creatingEmployeur;

    if (!this.creatingEmployeur) {
      this.form.controls.nomEmployeur.setValue('');
      this.form.controls.nomEmployeur.clearValidators();
      this.form.controls.nomEmployeur.updateValueAndValidity();
      return;
    }

    this.form.controls.nomEmployeur.setValidators([Validators.required]);
    this.form.controls.nomEmployeur.updateValueAndValidity();
  }

  createEmployeur(): void {
    const nomEmployeur = (this.form.controls.nomEmployeur.value ?? '').trim();
    if (!nomEmployeur) {
      this.form.controls.nomEmployeur.markAsTouched();
      return;
    }

    this.employeurLoading = true;
    this.employeurService.create({ id: 0, nomEmployeur }).subscribe({
      next: (created) => {
        this.employeurLoading = false;
        this.employeurs = [...this.employeurs, created].sort((a, b) =>
          a.nomEmployeur.localeCompare(b.nomEmployeur, 'fr', { sensitivity: 'base' })
        );
        this.form.controls.idEmployeur.setValue(created.id);
        this.toggleCreateEmployeur();
      },
      error: () => {
        this.employeurLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const normalizedType = (value.type ?? '').toLowerCase();
    const employeurPayload = normalizedType === 'externe'
      ? { id: value.idEmployeur as number, nomEmployeur: '' }
      : null;

    const payload: Formateur = {
      id: this.data.formateur?.id ?? 0,
      nom: value.nom ?? '',
      prenom: value.prenom ?? '',
      email: value.email ?? '',
      tel: Number(value.tel),
      type: normalizedType,
      employeur: employeurPayload
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  private bindTypeRules(): void {
    this.form.controls.type.valueChanges.subscribe((value) => {
      this.syncEmployeurValidators(value);
    });
  }

  private syncEmployeurValidators(typeValue: string | null): void {
    const isExterne = (typeValue ?? '').toLowerCase() === 'externe';

    if (isExterne) {
      this.form.controls.idEmployeur.setValidators([Validators.required]);
      this.form.controls.idEmployeur.updateValueAndValidity();
      return;
    }

    this.creatingEmployeur = false;
    this.form.controls.nomEmployeur.setValue('');
    this.form.controls.nomEmployeur.clearValidators();
    this.form.controls.nomEmployeur.updateValueAndValidity();

    this.form.controls.idEmployeur.setValue(null);
    this.form.controls.idEmployeur.clearValidators();
    this.form.controls.idEmployeur.updateValueAndValidity();
  }
}
