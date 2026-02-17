import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { CommonModule }    from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  styles: [`
    .dialog-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(239,68,68,.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }
    .dialog-icon mat-icon {
      color: #ef4444;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }
    .product-name {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      background: rgba(239,68,68,.08);
      color: #ef4444;
      font-weight: 600;
      font-size: .9rem;
    }
  `],
  template: `
    <div mat-dialog-title style="text-align:center;padding-top:20px">
      <div class="dialog-icon">
        <mat-icon>delete_outline</mat-icon>
      </div>
      <strong>Delete product?</strong>
    </div>

    <div mat-dialog-content style="text-align:center;padding-bottom:8px">
      <p style="color:var(--pms-text-muted,#64748b);margin:0 0 12px">
        This action cannot be undone.
      </p>
      <span class="product-name">{{ data.name }}</span>
    </div>

    <div mat-dialog-actions style="justify-content:center;gap:10px;padding:16px 20px 20px">
      <button mat-stroked-button (click)="close(false)" style="min-width:96px">
        Cancel
      </button>
      <button mat-raised-button color="warn" (click)="close(true)" style="min-width:96px">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </div>
  `,
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private ref: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  close(value: boolean) { this.ref.close(value); }
}