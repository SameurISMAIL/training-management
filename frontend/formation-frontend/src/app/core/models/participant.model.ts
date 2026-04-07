import { Profil } from './profil.model';
import { Structure } from './structure.model';

export interface Participant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  tel: number;
  structure: Structure | null;
  profil: Profil | null;
}
