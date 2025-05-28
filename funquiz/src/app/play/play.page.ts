import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class PlayPage implements OnInit, OnDestroy {

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

  private audioPlayer: HTMLAudioElement | null = null;
  private bgmEnabled: boolean = true;
  private navigatingToLevel: boolean = false;
  private gameLevelRoutes: string[] = ['/easy', '/medium', '/hard', '/extreme'];

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkLevelUnlocks();
  }

  ionViewWillEnter() {
    this.loadBgmSetting();
    this.playBackgroundMusic();
  }

  ionViewWillLeave() {
    if (this.navigatingToLevel) {
      this.navigatingToLevel = false;
    } else {
      this.pauseBackgroundMusic();
    }
  }

  ngOnDestroy() {
    this.pauseBackgroundMusic();
    if (this.audioPlayer) {
      this.audioPlayer.src = '';
      this.audioPlayer = null;
    }
  }

  loadBgmSetting() {
    const bgmSetting = localStorage.getItem('bgm');
    this.bgmEnabled = bgmSetting !== null ? JSON.parse(bgmSetting) : true;
  }

  playBackgroundMusic() {
    if (this.bgmEnabled) {
      if (!this.audioPlayer) {
        this.audioPlayer = new Audio('../../assets/bg-music.mp3'); // Your specified path
        this.audioPlayer.loop = true;
      }

      if (this.audioPlayer.paused) {
        this.audioPlayer.play().catch(error => {
          console.warn('Background music autoplay was prevented:', error);
          // This warning is expected on initial page load/refresh without user interaction.
          // Music will play after the first user interaction.
        });
      }
    } else {
      this.pauseBackgroundMusic();
    }
  }

  pauseBackgroundMusic() {
    if (this.audioPlayer && !this.audioPlayer.paused) {
      this.audioPlayer.pause();
    }
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
      if (this.gameLevelRoutes.includes(selectedLevel.route)) {
        this.navigatingToLevel = true;
      }
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