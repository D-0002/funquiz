import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; 

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule 
  ]
})
export class AccountPage {
  
  constructor(private router: Router) {}
  
  goToDetails() {
    this.router.navigate(['/account-details']);
  }
  
  goToSignup() {
    this.router.navigate(['/signup']);
  }
 
}