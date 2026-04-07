import { Employeur } from './employeur.model';

export interface Formateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  tel: number;
  type: string;
  employeur: Employeur | null;
}
