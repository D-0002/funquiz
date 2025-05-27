import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
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
  IonBackButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
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
    
    CommonModule,
    FormsModule
  ]
})
export class LeaderboardPage implements OnInit {
  rankings = [
    { rank: 1, name: 'Player One', score: 0 },
    { rank: 2, name: 'Player Two', score: 0 },
    { rank: 3, name: 'Player Three', score: 0 },
    { rank: 4, name: 'Player Four', score: 0 },
    { rank: 5, name: 'Player Five', score: 0 },
    { rank: 6, name: 'Player Six', score: 0 },
    { rank: 7, name: 'Player Seven', score: 0 },
    { rank: 8, name: 'Player Eight', score: 0 },
    { rank: 9, name: 'Player Nine', score: 0 },
    { rank: 10, name: 'Player Ten', score: 0 }
  ];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
  }
  
  goToMainMenu() {
    this.router.navigate(['/welcome']);
  }
}