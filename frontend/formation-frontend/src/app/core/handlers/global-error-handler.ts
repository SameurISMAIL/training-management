import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly snackBar: MatSnackBar) {}

  handleError(error: unknown): void {
    console.error(error);

    this.snackBar.open('Une erreur inattendue est survenue', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
