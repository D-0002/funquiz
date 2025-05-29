import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.page.html',
  styleUrls: ['./account-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AccountDetailsPage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/mainmenu']);
    }
  }

  login() {
    if (!this.username || !this.password) {
      this.showToast('Please enter both username and password');
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.showToast('Login successful!');
        this.router.navigate(['/mainmenu']);
      },
      error: (error) => {
        const errorMessage = error.error?.error || 'Login failed. Please try again.';
        this.showToast(errorMessage);
        console.error('Login error:', error);
      }
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}