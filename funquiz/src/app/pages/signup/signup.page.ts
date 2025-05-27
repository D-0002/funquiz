import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SignupPage implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  
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
  
  signup() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.showToast('Please fill in all fields');
      return;
    }

    if (this.password.trim() === '') {
        this.showToast('Password cannot be empty or just spaces.');
        return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Passwords do not match');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.showToast('Please enter a valid email address');
      return;
    }

    this.authService.signup(this.username, this.email, this.password).subscribe({
      next: (response) => {
        this.showToast('Account created successfully! Please log in.');
        this.router.navigate(['/account']); 
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.error?.error || 'Signup failed. Please try again.';
        this.showToast(errorMessage);
        console.error('Signup error:', error);
      }
    });
  }
  
  accountDetails() {
    this.router.navigate(['/account']); 
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: message.toLowerCase().includes('success') ? 'success' : (message.toLowerCase().includes('please log in') ? 'success' : 'danger')
    });
    toast.present();
  }
}