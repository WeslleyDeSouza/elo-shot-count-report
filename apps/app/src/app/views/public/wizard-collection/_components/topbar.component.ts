import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateService } from '@app-galaxy/translate-ui';
import {RouterLink} from "@angular/router";
import {LayoutThemeTogglerComponent} from "@app-galaxy/sdk-ui";

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topbar">
      <div class="topbar-content">
        <!-- Logo and Title -->
        <div class="topbar-brand">
          <div class="swiss-flag">
            <i class="ri-add-line"></i>
          </div>
          <div class="brand-text">
            <div class="confederation-text">Schweizerische Eidgenossenschaft</div>
            <div class="confederation-subtext">Confédération suisse</div>
            <div class="confederation-subtext">Confederazione Svizzera</div>
            <div class="confederation-subtext">Confederaziun svizra</div>
          </div>
        </div>

        <!-- Language Selector -->
        <div class="language-selector">
          <button (click)="setLanguage('de')" [class]="'lang-btn' + (ts.lang === 'de' ? ' active' : '')">DE</button>
          <button (click)="setLanguage('fr')" [class]="'lang-btn' + (ts.lang === 'fr' ? ' active' : '')">FR</button>
          <button (click)="setLanguage('it')" [class]="'lang-btn' + (ts.lang === 'it' ? ' active' : '')">IT</button>
          <button (click)="setLanguage('en')" [class]="'lang-btn' + (ts.lang === 'en' ? ' active' : '')">EN</button>
        </div>

        <!-- User Profile -->
        <div class="d-flex gab-2">
           <layout-theme-toggler />
          <a [routerLink]="'/admin'" class="user-profile">
            <i class="ri-user-line"></i>
          </a>
        </div>

      </div>
    </div>
  `,
  imports: [
    RouterLink,
    LayoutThemeTogglerComponent
  ],
  styles: [`
    .topbar {
      background-color: #2d5a5a;
      color: white;
      padding: 0;
      position: relative;
      z-index: 1000;
    }

    .topbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 8px 16px;
      min-height: 56px;
    }

    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .swiss-flag {
      width: 32px;
      height: 32px;
      background-color: #dc143c;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      position: relative;
    }

    .swiss-flag i {
      color: white;
      font-size: 20px;
      font-weight: bold;
      transform: rotate(0deg);
    }

    .swiss-flag::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 4px;
      background-color: white;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .swiss-flag::after {
      content: '';
      position: absolute;
      width: 4px;
      height: 20px;
      background-color: white;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .confederation-text {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.2;
    }

    .confederation-subtext {
      font-size: 11px;
      opacity: 0.9;
      line-height: 1.1;
    }

    .language-selector {
      display: flex;
      gap: 1px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      padding: 2px;
    }

    .lang-btn {
      background: none;
      border: none;
      color: white;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 2px;
      transition: background-color 0.2s ease;
    }

    .lang-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .lang-btn.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    .user-profile {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .user-profile:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .user-profile i {
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .topbar-content {
        padding: 8px 12px;
      }

      .brand-text {
        display: none;
      }

      .language-selector {
        gap: 0;
      }

      .lang-btn {
        padding: 4px 8px;
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .confederation-subtext {
        display: none;
      }

      .confederation-text {
        font-size: 12px;
      }
    }
  `]
})
export class TopbarWizardCollectionComponent {
  readonly ts = inject(TranslateService);

  setLanguage(lang:string){
    this.ts.lang = lang
  }
}
