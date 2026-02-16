import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../core/auth.service';
import { ThemeService, ThemeMode } from '../../core/theme.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,

    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDividerModule,

    TranslateModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private theme = inject(ThemeService);
  private lang = inject(LanguageService);

  get isDark(): boolean {
    return this.theme.current === 'dark';
  }

  get languageLabel(): 'EN' | 'FR' {
    return this.lang.lang === 'fr' ? 'FR' : 'EN';
  }

  onThemeToggle(checked: boolean): void {
    const mode: ThemeMode = checked ? 'dark' : 'light';
    this.theme.set(mode);
  }

  toggleLanguage(): void {
    this.lang.toggle();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
