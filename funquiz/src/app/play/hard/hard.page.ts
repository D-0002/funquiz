import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonButton, IonBackButton, IonModal, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

interface Question { word: string; definition: string; }
const QUESTIONS_PER_GAME = 5; // Number of questions per game session

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
  // Full pool of questions for Hard level
  questions: Question[] = [
    { word: 'TONE', definition: 'The speakers attitude in the poem.' },
    { word: 'SPEAKER', definition: 'The person who speaks in the poem.' },
    { word: 'THEME', definition: 'The overall message or lesson of the poem.' },
    { word: 'REPETITION', definition: 'A word or phrase repeated for emphasis.' },
    { word: 'FORM', definition: 'The structure or pattern of lines and stanzas.' },
    { word: 'METAPHOR', definition: 'Comparing two unlike things by saying one is the other.' }, // Already in Easy, might be intended for review or a typo
    { word: 'DICTION', definition: 'The poet’s choice of words.' },
    { word: 'CADENCE', definition: 'A poem’s rhythm and structure as it is read aloud.' },
    { word: 'MORAL', definition: 'The message or insight about life in a poem.' },
    { word: 'CONCRETEPOETRY', definition: 'The arrangement of words to form a visual image.' }
  ];

  activeGameQuestions: Question[] = []; // Questions for the current game
  currentQuestionIndex: number = 0;
  currentQuestion!: Question;
  userAnswer: string[] = [];
  availableLetters: string[] = [];
  usedLetters: Set<string> = new Set();
  feedback: string = '';
  feedbackIsError: boolean = false;
  score: number = 0;
  showResults: boolean = false;
  hasNextLevel: boolean = true; // Hard level has a next level (Extreme)

  constructor(private router: Router) {}

  ngOnInit() {
    this.prepareNewGameSet();
    this.initializeGame();
  }

  prepareNewGameSet() {
    const shuffledPool = [...this.questions].sort(() => 0.5 - Math.random());
    // Select a subset of questions for the game
    this.activeGameQuestions = shuffledPool.slice(0, Math.min(QUESTIONS_PER_GAME, shuffledPool.length));
    this.currentQuestionIndex = 0; // Reset index for the new set
  }

  initializeGame() {
    if (this.activeGameQuestions.length === 0 || this.currentQuestionIndex >= this.activeGameQuestions.length) {
        this.prepareNewGameSet(); // Prepare a new set if current one is exhausted or empty
        if (this.activeGameQuestions.length === 0) {
          console.error("Failed to initialize game: No questions available for Hard level.");
          // Optionally, navigate away or show an error message to the user
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
    const desiredKeyboardSize = 24;

    while (allKeyboardLetters.size < desiredKeyboardSize && allKeyboardLetters.size < alphabet.length) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!allKeyboardLetters.has(randomLetter)) { // Ensure unique decoy letters if possible
        allKeyboardLetters.add(randomLetter);
      }
    }
    
    this.availableLetters = Array.from(allKeyboardLetters).sort(() => 0.5 - Math.random());
  }

  resetQuestion() {
    this.userAnswer = Array(this.currentQuestion.word.length).fill('');
    this.usedLetters = new Set<string>(); // Clear used letters relevant to the current attempt
    // Feedback is reset before next attempt or next question
  }

  selectLetter(letter: string) {
    if (this.usedLetters.has(letter) && !this.currentQuestion.word.includes(letter)) { // Allow re-using letters if they are part of the word
        // More complex logic might be needed if a letter appears multiple times in the word
        // For now, if it's used, it's used for one slot.
    }
    const firstEmptyIndex = this.userAnswer.indexOf('');
    if (firstEmptyIndex !== -1) {
      this.userAnswer[firstEmptyIndex] = letter;
      this.usedLetters.add(letter); // Mark letter as used for keyboard styling
    }
    this.feedback = ''; // Clear feedback on new letter selection
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
      this.feedback = 'Correct!';
      this.feedbackIsError = false;
      this.score++;
      setTimeout(() => this.nextQuestion(), 1500);
    } else {
      this.feedback = 'Try again!';
      this.feedbackIsError = true;

      setTimeout(() => {
        this.userAnswer = Array(this.currentQuestion.word.length).fill('');
        this.usedLetters.clear(); 
        this.feedback = 'Try again! Keyboard reset.'; 
      }, 1500);
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.activeGameQuestions.length) {
      this.initializeGame(); 
    } else {
      this.saveHardScore();
      this.showResults = true;
    }
  }

  saveHardScore() { 
    localStorage.setItem('hardScore', this.score.toString()); 
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