import { Component, OnInit } from '@angular/core';
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

const EXTREME_BASE_POINTS_PER_QUESTION = 20;
const EXTREME_PENALTY_PER_WRONG_ATTEMPT = 5;
const EXTREME_MIN_POINTS_IF_CORRECT = 4;     // Minimum points for a correct answer

@Component({
  selector: 'app-extreme',
  templateUrl: './extreme.page.html',
  styleUrls: ['./extreme.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonButton, IonBackButton, IonModal, IonList, IonItem, IonLabel,
    CommonModule, FormsModule
  ]
})
export class ExtremePage implements OnInit {
  questions: Question[] = [
    { word: 'SHAPEPOEM', definition: 'A poem written in the shape of the subject.' },
    { word: 'EPIC', definition: 'A long narrative poem about heroic deeds.' },
    { word: 'ELEGY', definition: 'A poem mourning the death of someone.' },
    { word: 'SONNET', definition: 'A fourteen-line poem with a specific rhyme scheme.' },
    { word: 'BALLAD', definition: 'A narrative poem, often of folk origin and intended to be sung.' },
    { word: 'LYRIC', definition: 'A poem expressing personal emotions or feelings, typically spoken in the first person.' },
    { word: 'ODE', definition: 'A lyric poem addressing a particular subject, often celebrated.' },
    { word: 'BLANKVERSE', definition: 'Poetry written in unrhymed iambic pentameter.' },
    { word: 'FREEVERSE', definition: 'Poetry that does not rhyme or have a regular meter.' },
    { word: 'HAIKU', definition: 'A Japanese poem of seventeen syllables, in three phrases of five, seven, and five.' }
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
  hasNextLevel: boolean = false; 

  currentQuestionAttempts: number = 0; 

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.prepareNewGameSet();
    this.initializeGame();
  }

  prepareNewGameSet() {
    const shuffledPool = [...this.questions].sort(() => 0.5 - Math.random());
    this.activeGameQuestions = shuffledPool.slice(0, Math.min(QUESTIONS_PER_GAME, shuffledPool.length));
    this.currentQuestionIndex = 0;
  }

  initializeGame() {
    if (this.activeGameQuestions.length === 0 || this.currentQuestionIndex >= this.activeGameQuestions.length) {
        this.prepareNewGameSet();
        if (this.activeGameQuestions.length === 0) {
          console.error("Failed to initialize game: No questions available for Extreme level.");
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
    const desiredKeyboardSize = 24;

    while (allKeyboardLetters.size < desiredKeyboardSize && allKeyboardLetters.size < alphabet.length) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!allKeyboardLetters.has(randomLetter)) {
         allKeyboardLetters.add(randomLetter);
      }
    }
    this.availableLetters = Array.from(allKeyboardLetters).sort(() => 0.5 - Math.random());
  }

  resetAttemptUI() {
    this.userAnswer = Array(this.currentQuestion.word.length).fill('');
    this.usedLetters = new Set<string>();
  }

  selectLetter(letter: string) {
    const firstEmptyIndex = this.userAnswer.indexOf('');
    if (firstEmptyIndex !== -1) {
      this.userAnswer[firstEmptyIndex] = letter;
      this.usedLetters.add(letter);
    }
    this.feedback = '';
    this.feedbackIsError = false;
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
      let pointsEarned = EXTREME_BASE_POINTS_PER_QUESTION - (this.currentQuestionAttempts * EXTREME_PENALTY_PER_WRONG_ATTEMPT);
      pointsEarned = Math.max(pointsEarned, EXTREME_MIN_POINTS_IF_CORRECT);

      this.score += pointsEarned;
      this.feedback = `Correct! +${pointsEarned} points.`;
      this.feedbackIsError = false;
      setTimeout(() => this.nextQuestion(), 2000);
    } else {
      this.currentQuestionAttempts++;
      this.feedback = `Incorrect. Try again!`; 
      this.feedbackIsError = true;
      setTimeout(() => {
        this.resetAttemptUI();
      }, 1500);
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
    localStorage.setItem('extremeScore', this.score.toString());
    if (this.authService.currentUserValue && this.score > 0) {
      this.authService.updateScore(this.score).subscribe({
        next: (response) => {
          console.log(`Extreme level score (${this.score}) updated on backend. New total score: ${response.user.total_score}`);
        },
        error: (err) => {
          console.error('Failed to update extreme level score on backend:', err.message);
        }
      });
    } else if (this.score > 0) {
      console.log('User not logged in or score is zero. Extreme level score not sent to backend.');
    }
  }

  restart() {
    this.score = 0;
    this.showResults = false;
    this.prepareNewGameSet();
    this.initializeGame();
  }

  goBack() {
    this.showResults = false;
    this.router.navigate(['/play']);
  }
}