import { Component, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MatToolbarModule }     from '@angular/material/toolbar';
import { MatSidenavModule }     from '@angular/material/sidenav';
import { MatIconModule }        from '@angular/material/icon';
import { MatListModule }        from '@angular/material/list';
import { MatButtonModule }      from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule }     from '@angular/material/divider';

import { TranslateModule } from '@ngx-translate/core';

import { AuthService }             from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { LanguageService }         from '../../core/language.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
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
export class MainLayoutComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private theme  = inject(ThemeService);
  private lang   = inject(LanguageService);

  isMobile  = false;
  pageTitle = 'Products';

  ngOnInit(): void {
    this.checkMobile();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());
    this.updateTitle();
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }

  private updateTitle(): void {
    const url = this.router.url;
    if (url.includes('/products/new'))  this.pageTitle = 'New Product';
    else if (url.includes('/edit'))     this.pageTitle = 'Edit Product';
    else if (url.includes('/products')) this.pageTitle = 'Products';
    else                                this.pageTitle = 'PMS';
  }

  get isDark(): boolean {
    return this.theme.current === 'dark';
  }

  get languageLabel(): 'EN' | 'FR' {
    return this.lang.lang === 'fr' ? 'FR' : 'EN';
  }

  onThemeToggle(checked: boolean): void {
    this.theme.set(checked ? 'dark' : 'light');
  }

  toggleLanguage(): void {
    this.lang.toggle();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}