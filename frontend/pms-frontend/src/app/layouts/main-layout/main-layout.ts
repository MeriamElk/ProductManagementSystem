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

import { AuthService } from '../../core/auth.service';

type Lang = 'FR' | 'EN';

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
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  darkMode = false;
  language: Lang = 'FR';

  // mini i18n local (juste pour rendre le switch visible)
  t(key: 'products' | 'theme' | 'dark' | 'light' | 'language' | 'logout' | 'title'): string {
    const dict: Record<Lang, Record<string, string>> = {
      FR: {
        title: 'PMS Frontend',
        products: 'Produits',
        theme: 'Thème',
        dark: 'Sombre',
        light: 'Clair',
        language: 'Langue',
        logout: 'Déconnexion',
      },
      EN: {
        title: 'PMS Frontend',
        products: 'Products',
        theme: 'Theme',
        dark: 'Dark',
        light: 'Light',
        language: 'Language',
        logout: 'Logout',
      },
    };
    return dict[this.language][key];
  }

  toggleTheme(checked: boolean) {
    this.darkMode = checked;
  }

  toggleLanguage() {
    this.language = this.language === 'FR' ? 'EN' : 'FR';
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
