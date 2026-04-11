import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="dialog-header">
      <div style="display:flex;align-items:center;gap:10px">
        <mat-icon>{{ icon }}</mat-icon>
        <h2>{{ title }}</h2>
      </div>
      <button mat-icon-button (click)="close()">
        <mat-icon style="color:white">close</mat-icon>
      </button>
    </div>
    <div class="dialog-content">
      <ng-content></ng-content>
    </div>
  `
})
export class FormDialogComponent {
  @Input() title = '';
  @Input() icon = '';

  private readonly dialogRef = inject(MatDialogRef<FormDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
