import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { AuthService } from '../../core/services/auth.service';
import { Formation } from '../../core/models/formation.model';
import { FormateurService } from '../../core/services/formateur.service';
import { FormationService } from '../../core/services/formation.service';
import { ParticipantService } from '../../core/services/participant.service';

interface DashboardCard {
  title: string;
  icon: string;
  link: string;
  count: number;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatBadgeModule, MatListModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  login = '';
  role = '';

  quickAccessCards: DashboardCard[] = [
    { title: 'Formations', icon: 'school', link: '/formations', count: 0, colorClass: 'card-indigo' },
    { title: 'Formateurs', icon: 'groups', link: '/formateurs', count: 0, colorClass: 'card-teal' },
    { title: 'Participants', icon: 'person', link: '/participants', count: 0, colorClass: 'card-orange' }
  ];

  adminCards: DashboardCard[] = [
    { title: 'Administration', icon: 'admin_panel_settings', link: '/admin/domaines', count: 0, colorClass: 'card-red' },
    { title: 'Utilisateurs', icon: 'manage_accounts', link: '/admin/users', count: 0, colorClass: 'card-red' }
  ];
  latestFormations: Formation[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly formationService: FormationService,
    private readonly formateurService: FormateurService,
    private readonly participantService: ParticipantService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getLogin();
    this.role = this.authService.getRole();

    forkJoin({
      formations: this.formationService.getAllFormations(),
      formateurs: this.formateurService.getAll(),
      participants: this.participantService.getAll()
    }).subscribe({
      next: ({ formations, formateurs, participants }) => {
        this.quickAccessCards = [
          { ...this.quickAccessCards[0], count: formations.length },
          { ...this.quickAccessCards[1], count: formateurs.length },
          { ...this.quickAccessCards[2], count: participants.length }
        ];

        this.latestFormations = [...formations]
          .sort((a, b) => (b.annee - a.annee) || (b.id - a.id))
          .slice(0, 5);
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

}
