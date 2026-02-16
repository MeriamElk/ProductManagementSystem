import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'pms_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mode: ThemeMode = 'light';

  init(): void {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeMode | null);
    this.mode = saved === 'dark' ? 'dark' : 'light';
    this.apply(this.mode);
  }

  get current(): ThemeMode {
    return this.mode;
  }

  toggle(): void {
    this.apply(this.mode === 'dark' ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    this.apply(mode);
  }

  private apply(mode: ThemeMode): void {
    this.mode = mode;
    localStorage.setItem(THEME_KEY, mode);

    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
  }
}
