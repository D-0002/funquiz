import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, 
         IonIcon, IonList, IonItem, IonLabel, IonBackButton, IonCard, 
         IonCardHeader, IonCardTitle, IonCardContent, IonChip } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-to-play',
  templateUrl: './how-to-play.page.html',
  styleUrls: ['./how-to-play.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    CommonModule, 
    FormsModule
  ]
})
export class HowToPlayPage implements OnInit {
  
  constructor(private router: Router) { }
  
  ngOnInit() {
  }
  
  goToMainMenu() {
    this.router.navigate(['/mainmenu']);
  }
}