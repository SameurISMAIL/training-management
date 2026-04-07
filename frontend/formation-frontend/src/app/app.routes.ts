import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormationDetailComponent } from './pages/formations/formation-detail/formation-detail.component';
import { FormationFormComponent } from './pages/formations/formation-form/formation-form.component';
import { FormationListComponent } from './pages/formations/formation-list/formation-list.component';
import { FormateurListComponent } from './pages/formateurs/formateur-list/formateur-list.component';
import { FormateurFormComponent } from './pages/formateurs/formateur-form/formateur-form.component';
import { LoginComponent } from './pages/login/login.component';
import { DomainesComponent } from './pages/domaines/domaines.component';
import { StructuresComponent } from './pages/structures/structures.component';
import { ProfilsComponent } from './pages/profils/profils.component';
import { AdminUsersComponent } from './pages/users/admin-users/admin-users.component';
import { ParticipantListComponent } from './pages/participants/participant-list/participant-list.component';
import { ParticipantFormComponent } from './pages/participants/participant-form/participant-form.component';
import { StatistiqueComponent } from './pages/statistique/statistique.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'formations', component: FormationListComponent, canActivate: [authGuard] },
	{ path: 'formations/:id', component: FormationDetailComponent, canActivate: [authGuard] },
	{ path: 'formations/new', component: FormationFormComponent, canActivate: [authGuard] },
	{ path: 'formations/:id/edit', component: FormationFormComponent, canActivate: [authGuard] },
	{ path: 'formateurs', component: FormateurListComponent, canActivate: [authGuard] },
	{ path: 'formateurs/new', component: FormateurFormComponent, canActivate: [authGuard] },
	{ path: 'formateurs/:id/edit', component: FormateurFormComponent, canActivate: [authGuard] },
	{ path: 'participants', component: ParticipantListComponent, canActivate: [authGuard] },
	{ path: 'participants/new', component: ParticipantFormComponent, canActivate: [authGuard] },
	{ path: 'participants/:id/edit', component: ParticipantFormComponent, canActivate: [authGuard] },
	{ path: 'domaines', component: DomainesComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'structures', component: StructuresComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'profils', component: ProfilsComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'admin/domaines', component: DomainesComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'admin/structures', component: StructuresComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'admin/profils', component: ProfilsComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'users', component: AdminUsersComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'admin/users', component: AdminUsersComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur'] } },
	{ path: 'admin', redirectTo: 'admin/domaines', pathMatch: 'full' },
	{
		path: 'statistiques',
		component: StatistiqueComponent,
		canActivate: [roleGuard],
		data: { roles: ['ROLE_RESPONSABLE', 'RESPONSABLE', 'responsable', 'ROLE_ADMIN', 'ADMIN', 'administrateur'] }
	},
	{ path: 'unauthorized', component: UnauthorizedComponent },
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: '**', redirectTo: 'dashboard' }
];
