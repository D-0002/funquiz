import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonButton, IonBackButton, IonModal, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

interface Question { word: string; definition: string; }
const QUESTIONS_PER_GAME = 5;

@Component({
  selector: 'app-medium',
  templateUrl: './medium.page.html',
  styleUrls: ['./medium.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonButton, IonBackButton, IonModal, IonList, IonItem, IonLabel,
    CommonModule, FormsModule
  ]
})
export class MediumPage implements OnInit {
  questions: Question[] = [
    { word: 'ALLITERATION', definition: 'The repetition of initial consonant sounds in words.' },
    { word: 'PERSONIFICATION', definition: 'Giving human qualities to non-human things.' },
    { word: 'ONOMATOPOEIA', definition: 'Words that imitate the sound they represent.' },
    { word: 'HYPERBOLE', definition: 'Deliberate and obvious exaggeration for effect.' },
    { word: 'IMAGERY', definition: 'Vivid and descriptive language that appeals to the senses.' },
    { word: 'SYMBOLISM', definition: 'Using objects or actions to represent ideas or concepts.' },
    { word: 'IRONY', definition: 'The contrast between expectation and reality.' },
    { word: 'ALLUSION', definition: 'An indirect reference to another work of literature.' },
    { word: 'CONSONANCE', definition: 'The repetition of consonant sounds within or at the end of words.' },
    { word: 'ASSONANCE', definition: 'The repetition of vowel sounds within words.' }
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
  hasNextLevel: boolean = true; // Medium has Hard as next level

  constructor(private router: Router) {}

  ngOnInit() {
    this.prepareNewGameSet();
    this.initializeGame();
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
  }

  shuffleLetters() {
    const wordLetters = this.currentQuestion.word.toUpperCase().split('');
    const requiredLetters = new Set<string>(wordLetters);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const allKeyboardLetters = new Set<string>(requiredLetters);
    const desiredKeyboardSize = 20; // Slightly more letters for medium difficulty

    while (allKeyboardLetters.size < desiredKeyboardSize && allKeyboardLetters.size < alphabet.length) {
      allKeyboardLetters.add(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    
    this.availableLetters = Array.from(allKeyboardLetters).sort(() => 0.5 - Math.random());
  }

  resetQuestion() {
    this.userAnswer = Array(this.currentQuestion.word.length).fill('');
    this.usedLetters = new Set<string>();
    this.feedback = '';
    this.feedbackIsError = false;
  }

  selectLetter(letter: string) {
    if (!this.userAnswer.includes('')) return;
    const firstEmptyIndex = this.userAnswer.indexOf('');
    if (firstEmptyIndex !== -1) {
      this.userAnswer[firstEmptyIndex] = letter;
      this.usedLetters.add(letter);
    }
  }

  backspace() {
    for (let i = this.userAnswer.length - 1; i >= 0; i--) {
      if (this.userAnswer[i] !== '') {
        const letterRemoved = this.userAnswer[i];
        this.userAnswer[i] = '';
        if (!this.userAnswer.includes(letterRemoved)) this.usedLetters.delete(letterRemoved);
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
      this.feedback = 'Correct!';
      this.feedbackIsError = false;
      this.score++;
      setTimeout(() => this.nextQuestion(), 1500);
    } else {
      this.feedback = 'Try again!';
      this.feedbackIsError = true;
      setTimeout(() => this.resetQuestion(), 1500);
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.activeGameQuestions.length) {
      this.initializeGame(); 
    } else {
      this.saveMediumScore();
      this.showResults = true;
    }
  }

  saveMediumScore() { 
    localStorage.setItem('mediumScore', this.score.toString()); 
  }

  restart() {
    this.score = 0;
    this.showResults = false;
    this.prepareNewGameSet();
    this.initializeGame(); 
  }

  goToNextLevel() {
    this.showResults = false;
    this.router.navigate(['/hard']); // Navigate to Hard level
  }

  goBack() {
    this.showResults = false;
    this.router.navigate(['/play']);
  }
}