import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Formation } from '../../../core/models/formation.model';
import { FormationService } from '../../../core/services/formation.service';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.css'
})
export class FormationDetailComponent implements OnInit {
  formation: Formation | null = null;
  loading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formationService: FormationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/formations']);
      return;
    }

    this.formationService.getFormationById(id).subscribe({
      next: (formation) => {
        this.formation = formation;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/formations']);
      }
    });
  }
}
