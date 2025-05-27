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
export class EasyPage implements OnInit {
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
  hasNextLevel: boolean = true; // Easy always has a next level (Medium)

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
    const desiredKeyboardSize = 16;

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
      this.saveEasyScore();
      this.showResults = true;
    }
  }

  saveEasyScore() { 
    localStorage.setItem('easyScore', this.score.toString()); 
  }

  restart() {
    this.score = 0;
    this.showResults = false;
    this.prepareNewGameSet();
    this.initializeGame(); 
  }

  goToNextLevel() {
    this.showResults = false;
    this.router.navigate(['/medium']); // Navigate to Medium level
  }

  goBack() {
    this.showResults = false;
    this.router.navigate(['/play']);
  }
}