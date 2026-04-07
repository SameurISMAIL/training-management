import { Domaine } from './domaine.model';
import { Formateur } from './formateur.model';
import { Participant } from './participant.model';

export interface Formation {
  id: number;
  titre: string;
  annee: number;
  duree: number;
  budget: number;
  domaine: Domaine | null;
  formateur: Formateur | null;
  participants: Participant[];
}
