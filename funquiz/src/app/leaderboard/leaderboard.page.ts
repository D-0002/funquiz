import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonSpinner,        
  IonRefresher,
  IonRefresherContent, 
  IonButton           
} from '@ionic/angular/standalone';
import { AuthService, LeaderboardPlayer } from '../../services/auth.service';

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
    IonList,
    IonItem,
    IonLabel,
    IonBackButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class LeaderboardPage implements OnInit {
  rankings: LeaderboardPlayer[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {} 

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard(event?: any) { 
    this.isLoading = true;
    this.errorMessage = null;
    this.rankings = []; 

    this.authService.getLeaderboard().subscribe({
      next: (data) => {
        this.rankings = data;
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      },
      error: (err) => {
        console.error('Error fetching leaderboard:', err);
        this.errorMessage = 'Failed to load leaderboard. Please try again.';
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  handleRefresh(event: any) {
    this.loadLeaderboard(event);
  }
}