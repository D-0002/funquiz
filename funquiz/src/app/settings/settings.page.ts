import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonToggle,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonToggle,
    IonButtons,
    IonBackButton,
    CommonModule,
    FormsModule
  ]
})
export class SettingsPage implements OnInit {

  bgm: boolean = true;
  sfx: boolean = false;
  vibration: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadSettings();
  }

  toggleSetting(setting: string, value: boolean) {
    localStorage.setItem(setting, JSON.stringify(value));
  }

  loadSettings() {
    this.bgm = JSON.parse(localStorage.getItem('bgm') ?? 'true');
    this.sfx = JSON.parse(localStorage.getItem('sfx') ?? 'false');
    this.vibration = JSON.parse(localStorage.getItem('vibration') ?? 'true');
  }

  goBack() {
    this.router.navigate(['/mainmenu']);
  }
}