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

const HARD_BASE_POINTS_PER_QUESTION = 15;
const HARD_PENALTY_PER_WRONG_ATTEMPT = 4;
const HARD_MIN_POINTS_IF_CORRECT = 3;      // Minimum points for a correct answers

@Component({
  selector: 'app-hard',
  templateUrl: './hard.page.html',
  styleUrls: ['./hard.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonButton, IonBackButton, IonModal, IonList, IonItem, IonLabel,
    CommonModule, FormsModule
  ]
})
export class HardPage implements OnInit {
  questions: Question[] = [
    { word: 'TONE', definition: 'The speakers attitude in the poem.' },
    { word: 'SPEAKER', definition: 'The person who speaks in the poem.' },
    { word: 'THEME', definition: 'The overall message or lesson of the poem.' },
    { word: 'REPETITION', definition: 'A word or phrase repeated for emphasis.' },
    { word: 'FORM', definition: 'The structure or pattern of lines and stanzas.' },
    { word: 'METAPHOR', definition: 'Comparing two unlike things by saying one is the other.' },
    { word: 'DICTION', definition: 'The poet’s choice of words.' },
    { word: 'CADENCE', definition: 'A poem’s rhythm and structure as it is read aloud.' },
    { word: 'MORAL', definition: 'The message or insight about life in a poem.' },
    { word: 'CONCRETEPOETRY', definition: 'The arrangement of words to form a visual image.' }
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
          console.error("Failed to initialize game: No questions available for Hard level.");
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
      let pointsEarned = HARD_BASE_POINTS_PER_QUESTION - (this.currentQuestionAttempts * HARD_PENALTY_PER_WRONG_ATTEMPT);
      pointsEarned = Math.max(pointsEarned, HARD_MIN_POINTS_IF_CORRECT);

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
    localStorage.setItem('hardScore', this.score.toString());
    if (this.authService.currentUserValue && this.score > 0) {
      this.authService.updateScore(this.score).subscribe({
        next: (response) => {
          console.log(`Hard level score (${this.score}) updated on backend. New total score: ${response.user.total_score}`);
        },
        error: (err) => {
          console.error('Failed to update hard level score on backend:', err.message);
        }
      });
    } else if (this.score > 0) {
      console.log('User not logged in or score is zero. Hard level score not sent to backend.');
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
    this.router.navigate(['/extreme']);
  }

  goBack() {
    this.showResults = false;
    this.router.navigate(['/play']);
  }
}