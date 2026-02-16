import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'en' | 'fr';
const LANG_KEY = 'pms_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private current: Lang = 'en';

  constructor(private translate: TranslateService) {}

  init(): void {
    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('en');

    const saved = (localStorage.getItem(LANG_KEY) as Lang | null);
    this.use(saved === 'fr' ? 'fr' : 'en');
  }

  get lang(): Lang {
    return this.current;
  }

  use(lang: Lang): void {
    this.current = lang;
    localStorage.setItem(LANG_KEY, lang);
    this.translate.use(lang);
  }

  toggle(): void {
    this.use(this.current === 'fr' ? 'en' : 'fr');
  }
}
