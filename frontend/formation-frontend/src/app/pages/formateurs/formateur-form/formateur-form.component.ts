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

import { Employeur } from '../../../core/models/employeur.model';
import { Formateur } from '../../../core/models/formateur.model';
import { EmployeurService } from '../../../core/services/employeur.service';
import { FormateurService } from '../../../core/services/formateur.service';

@Component({
  selector: 'app-formateur-form',
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
  templateUrl: './formateur-form.component.html',
  styleUrl: './formateur-form.component.css'
})
export class FormateurFormComponent implements OnInit {
  formateurId: number | null = null;
  isEditMode = false;
  loading = true;
  saving = false;

  employeurs: Employeur[] = [];

  formateurForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tel: ['', Validators.required],
    type: ['', Validators.required],
    idEmployeur: [null as number | null, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formateurService: FormateurService,
    private readonly employeurService: EmployeurService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.formateurId = idParam ? Number(idParam) : null;
      this.isEditMode = this.formateurId !== null && !Number.isNaN(this.formateurId);

      const formateur$ = this.isEditMode && this.formateurId !== null
        ? this.formateurService.getById(this.formateurId)
        : of(null);

      forkJoin({
        employeurs: this.employeurService.getAll(),
        formateur: formateur$
      }).subscribe({
        next: (result) => {
          this.employeurs = result.employeurs;

          if (result.formateur) {
            this.patchForm(result.formateur);
          }

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/formateurs']);
        }
      });
    });
  }

  get nomControl() {
    return this.formateurForm.controls.nom;
  }

  get prenomControl() {
    return this.formateurForm.controls.prenom;
  }

  get emailControl() {
    return this.formateurForm.controls.email;
  }

  get telControl() {
    return this.formateurForm.controls.tel;
  }

  get typeControl() {
    return this.formateurForm.controls.type;
  }

  get idEmployeurControl() {
    return this.formateurForm.controls.idEmployeur;
  }

  patchForm(formateur: Formateur): void {
    this.formateurForm.patchValue({
      nom: formateur.nom,
      prenom: formateur.prenom,
      email: formateur.email,
      tel: String(formateur.tel),
      type: formateur.type,
      idEmployeur: formateur.employeur?.id ?? null
    });
  }

  onSubmit(): void {
    if (this.formateurForm.invalid) {
      this.formateurForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.formateurForm.getRawValue();
    const payload: Formateur = {
      id: this.formateurId ?? 0,
      nom: formValue.nom ?? '',
      prenom: formValue.prenom ?? '',
      email: formValue.email ?? '',
      tel: Number(formValue.tel),
      type: formValue.type ?? '',
      employeur: {
        id: formValue.idEmployeur as number,
        nomEmployeur: ''
      }
    };

    const request$ = this.isEditMode && this.formateurId !== null
      ? this.formateurService.update(this.formateurId, payload)
      : this.formateurService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Formateur enregistré avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/formateurs']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Une erreur est survenue, veuillez réessayer', 'Fermer', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/formateurs']);
  }
}
