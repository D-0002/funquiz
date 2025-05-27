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
  // Full pool of questions for Extreme level
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
  hasNextLevel: boolean = false; // Extreme is the last level

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
          console.error("Failed to initialize game: No questions available for Extreme level.");
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
    const desiredKeyboardSize = 24; // Even more letters for Extreme difficulty

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
    this.usedLetters = new Set<string>();
    // Feedback reset before next attempt/question
  }

  selectLetter(letter: string) {
    // Logic for selecting a letter and adding to userAnswer
    const firstEmptyIndex = this.userAnswer.indexOf('');
    if (firstEmptyIndex !== -1) {
      this.userAnswer[firstEmptyIndex] = letter;
      this.usedLetters.add(letter);
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
        this.usedLetters.clear(); // Clear all used letters on wrong answer to "refresh" keyboard state
        this.feedback = 'Try again! Keyboard reset.'; // Update feedback
      }, 1500);
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.activeGameQuestions.length) {
      this.initializeGame(); 
    } else {
      this.saveExtremeScore();
      this.showResults = true; // Game over for this level
    }
  }

  saveExtremeScore() { 
    localStorage.setItem('extremeScore', this.score.toString()); 
    // Potentially save a "completedAllLevels" flag or calculate total game score here
  }

  restart() {
    this.score = 0;
    this.showResults = false;
    this.prepareNewGameSet(); // Get a new set of questions
    this.initializeGame(); 
  }

  goBack() {
    this.showResults = false;
    this.router.navigate(['/play']); // Navigate back to the main play/menu screen
  }
}