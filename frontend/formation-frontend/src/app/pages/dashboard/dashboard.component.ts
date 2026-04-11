import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { Formation } from '../../core/models/formation.model';
import { FormateurService } from '../../core/services/formateur.service';
import { FormationService } from '../../core/services/formation.service';
import { ParticipantService } from '../../core/services/participant.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatListModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  login = '';
  role = '';
  totalFormations = 0;
  totalFormateurs = 0;
  totalParticipants = 0;
  recentFormations: Formation[] = [];
  loading = true;

  constructor(
    private readonly authService: AuthService,
    private readonly formationService: FormationService,
    private readonly formateurService: FormateurService,
    private readonly participantService: ParticipantService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getLogin();
    this.role = this.authService.getRole();

    forkJoin([
      this.formationService.getAllFormations(),
      this.formateurService.getAll(),
      this.participantService.getAll()
    ]).subscribe({
      next: ([formations, formateurs, participants]) => {
        this.totalFormations = formations.length;
        this.totalFormateurs = formateurs.length;
        this.totalParticipants = participants.length;
        this.recentFormations = formations.slice(0, 5);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
