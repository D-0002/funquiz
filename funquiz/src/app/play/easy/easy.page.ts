import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonButton, IonBackButton, IonModal, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface Question { word: string; definition: string; }
const QUESTIONS_PER_GAME = 5;

const EASY_BASE_POINTS_PER_QUESTION = 5;
const EASY_PENALTY_PER_WRONG_ATTEMPT = 2;
const EASY_MIN_POINTS_IF_CORRECT = 1;

@Component({
  selector: 'app-easy',
  templateUrl: './easy.page.html',
  styleUrls: ['./easy.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonButton, IonBackButton, IonModal, IonList, IonItem, IonLabel,
    CommonModule, FormsModule
  ]
})
export class EasyPage implements OnInit, OnDestroy {
  questions: Question[] = [
    { word: 'RHYTHM', definition: 'The beat or musical quality of a poem.' },
    { word: 'STANZA', definition: 'A group of lines in a poem.' },
    { word: 'RHYME', definition: 'Words that sounds alike in a poem.' },
    { word: 'SIMILE', definition: 'A comparison using "like" or "as".' },
    { word: 'METAPHOR', definition: 'A direct comparison without using "like" or "as".' },
    { word: 'TOPIC', definition: 'The main idea or subject of a poem.' },
    { word: 'ENDRHYME', definition: 'The use of the same ending sound in poetry.' },
    { word: 'METER', definition: 'The pattern of beats or stresses in a poem.' },
    { word: 'VOICE', definition: 'The voice or character speaking in a poem.' },
    { word: 'REFRAIN', definition: 'A line that repeats throughout a poem.' }
  ];

  activeGameQuestions: Question[] = [];
  currentQuestionIndex: number = 0;
  currentQuestion!: Question;
  userAnswer: string[] = [];
  availableLetters: string[] = [];
  usedLetters: Set<string> = new Set();
  feedback: string = '';
  feedbackIsError: boolean = false;
  score: number = 0;
  showResults: boolean = false;
  hasNextLevel: boolean = true;

  currentQuestionAttempts: number = 0;
  private vibrationEnabled: boolean = true;
  private sfxEnabled: boolean = false;
  private clickSoundPlayer: HTMLAudioElement | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.loadVibrationSetting();
    this.loadSfxSetting();
    this.prepareNewGameSet();
    this.initializeGame();
  }

  ngOnDestroy() {
    if (this.clickSoundPlayer) {
      this.clickSoundPlayer.pause();
      this.clickSoundPlayer.src = '';
      this.clickSoundPlayer = null;
    }
  }

  loadVibrationSetting() {
    const vibrationSetting = localStorage.getItem('vibration');
    this.vibrationEnabled = vibrationSetting !== null ? JSON.parse(vibrationSetting) : true;
  }

  loadSfxSetting() {
    const sfxSetting = localStorage.getItem('sfx');
    this.sfxEnabled = sfxSetting !== null ? JSON.parse(sfxSetting) : false;
  }

  prepareNewGameSet() {
    const shuffledPool = [...this.questions].sort(() => 0.5 - Math.random());
    this.activeGameQuestions = shuffledPool.slice(0, QUESTIONS_PER_GAME);
    this.currentQuestionIndex = 0;
  }

  initializeGame() {
    if (this.activeGameQuestions.length === 0 || this.currentQuestionIndex >= this.activeGameQuestions.length) {
        this.prepareNewGameSet();
        if (this.activeGameQuestions.length === 0) {
          console.error("Failed to initialize game: No questions available.");
          return;
        }
    }
    this.currentQuestion = this.activeGameQuestions[this.currentQuestionIndex];
    this.userAnswer = Array(this.currentQuestion.word.length).fill('');
    this.shuffleLetters();
    this.usedLetters = new Set<string>();
    this.feedback = '';
    this.feedbackIsError = false;
    this.currentQuestionAttempts = 0;
  }

  shuffleLetters() {
    const wordLetters = this.currentQuestion.word.toUpperCase().split('');
    const requiredLetters = new Set<string>(wordLetters);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const allKeyboardLetters = new Set<string>(requiredLetters);
    const desiredKeyboardSize = 16;

    while (allKeyboardLetters.size < desiredKeyboardSize && allKeyboardLetters.size < alphabet.length) {
      allKeyboardLetters.add(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    this.availableLetters = Array.from(allKeyboardLetters).sort(() => 0.5 - Math.random());
  }

  resetAttemptUI() {
    this.userAnswer = Array(this.currentQuestion.word.length).fill('');
    this.usedLetters = new Set<string>();
  }

  selectLetter(letter: string) {
    if (!this.userAnswer.includes('')) return;
    const firstEmptyIndex = this.userAnswer.indexOf('');
    if (firstEmptyIndex !== -1) {
      this.userAnswer[firstEmptyIndex] = letter;
      this.usedLetters.add(letter);
      this.playClickSound(); 
    }
  }

  playClickSound() {
    if (this.sfxEnabled) {
      if (!this.clickSoundPlayer) {
        this.clickSoundPlayer = new Audio('../../../assets/click.mp3');
      }
      this.clickSoundPlayer.currentTime = 0;
      this.clickSoundPlayer.play().catch(error => console.warn("Click sound play failed:", error));
    }
  }

  backspace() {
    for (let i = this.userAnswer.length - 1; i >= 0; i--) {
      if (this.userAnswer[i] !== '') {
        const letterRemoved = this.userAnswer[i];
        this.userAnswer[i] = '';
        if (!this.userAnswer.includes(letterRemoved)) {
            this.usedLetters.delete(letterRemoved);
        }
        break;
      }
    }
    this.feedback = '';
    this.feedbackIsError = false;
  }

  canSubmit(): boolean {
    return !this.userAnswer.includes('');
  }

  submit() {
    if (!this.canSubmit()) return;

    const submittedAnswer = this.userAnswer.join('');

    if (submittedAnswer === this.currentQuestion.word) {
      let pointsEarned = EASY_BASE_POINTS_PER_QUESTION - (this.currentQuestionAttempts * EASY_PENALTY_PER_WRONG_ATTEMPT);
      pointsEarned = Math.max(pointsEarned, EASY_MIN_POINTS_IF_CORRECT);

      this.score += pointsEarned;
      this.feedback = `Correct! +${pointsEarned} points.`;
      this.feedbackIsError = false;
      setTimeout(() => this.nextQuestion(), 2000);
    } else {
      this.currentQuestionAttempts++;
      this.feedback = `Incorrect. Try again!`;
      this.feedbackIsError = true;
      this.triggerVibration();
      setTimeout(() => this.resetAttemptUI(), 1500);
    }
  }

  triggerVibration() {
    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(500);
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.activeGameQuestions.length) {
      this.initializeGame();
    } else {
      this.recordLevelCompletion();
      this.showResults = true;
    }
  }

  recordLevelCompletion() {
    localStorage.setItem('easyScore', this.score.toString());
    if (this.authService.currentUserValue && this.score > 0) {
      this.authService.updateScore(this.score).subscribe({
        next: (response) => {
          console.log(`Easy level score (${this.score}) updated on backend. New total score: ${response.user.total_score}`);
        },
        error: (err) => {
          console.error('Failed to update easy level score on backend:', err.message);
        }
      });
    } else if (this.score > 0) {
      console.log('User not logged in or score is zero. Easy level score not sent to backend.');
    }
  }

  restart() {
    this.score = 0;
    this.showResults = false;
    this.prepareNewGameSet();
    this.initializeGame();
  }

  goToNextLevel() {
    this.showResults = false;
    this.router.navigate(['/medium']);
  }

  goBack() {
    this.showResults = false;
    this.router.navigate(['/play']);
  }
}