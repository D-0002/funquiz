import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class WelcomePage {
  constructor(private router: Router) {}

  startGame() {
    this.router.navigate(['/account']);
  }

  howToPlay() {
    this.router.navigate(['/how-to-play']);
  }
}

