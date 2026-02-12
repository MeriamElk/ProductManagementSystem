import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirm deletion</h2>

    <div mat-dialog-content>
      Are you sure you want to delete this product?
      <div class="mt-2 font-semibold">{{ data.name }}</div>
    </div>

    <div mat-dialog-actions class="flex justify-end gap-2">
      <button mat-button (click)="close(false)">Cancel</button>
      <button mat-raised-button color="warn" (click)="close(true)">Delete</button>
    </div>
  `,
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private ref: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  close(value: boolean) {
    this.ref.close(value);
  }
}
