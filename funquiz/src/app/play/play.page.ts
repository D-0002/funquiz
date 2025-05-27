import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

interface Level {
  name: string;
  difficulty: string;
  locked: boolean;
  route: string;
  progress: number;
  selected?: boolean;
}

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class PlayPage implements OnInit {

  levels: Level[] = [
    {
      name: 'Easy',
      difficulty: 'Beginner friendly words',
      locked: false,
      route: '/easy',
      progress: 0,
      selected: false
    },
    {
      name: 'Medium',
      difficulty: 'Moderate challenge',
      locked: true,
      route: '/medium',
      progress: 0,
      selected: false
    },
    {
      name: 'Hard',
      difficulty: 'Expert level',
      locked: true,
      route: '/hard',
      progress: 0,
      selected: false
    },
    {
      name: 'Extreme',
      difficulty: 'Master level challenge',
      locked: true,
      route: '/extreme',
      progress: 0,
      selected: false
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkLevelUnlocks();
  }

  checkLevelUnlocks() {
    const easyCompleted = this.checkLevelCompletion('easy');
    if (easyCompleted) {
      this.levels[1].locked = false; 
    }

    const mediumCompleted = this.checkLevelCompletion('medium');
    if (mediumCompleted) {
      this.levels[2].locked = false; 
    }

    const hardCompleted = this.checkLevelCompletion('hard');
    if (hardCompleted) {
      this.levels[3].locked = false; 
    }
  }

  checkLevelCompletion(level: string): boolean {
    try {
      const score = localStorage.getItem(`${level}Score`);
      return score !== null && parseInt(score) > 0;
    } catch (error) {
      return false;
    }
  }

  selectLevel(index: number) {
    const selectedLevel = this.levels[index];
        
    this.levels.forEach(level => level.selected = false);
        
    selectedLevel.selected = true;
        
    if (!selectedLevel.locked) {
      this.router.navigate([selectedLevel.route]);
    }
  }

  unlockNextLevel(currentLevelIndex: number) {
    if (currentLevelIndex < this.levels.length - 1) {
      this.levels[currentLevelIndex + 1].locked = false;
    }
  }

  unlockMedium() {
    this.levels[1].locked = false;
  }

  unlockHard() {
    this.levels[2].locked = false;
  }

  unlockExtreme() {
    this.levels[3].locked = false;
  }
}