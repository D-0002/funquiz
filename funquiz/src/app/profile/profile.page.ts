import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  userName: string = '';
  userSex: string = 'Male';
  
  constructor(private navCtrl: NavController) {}
  
  ngOnInit() {}
  
  goToLeaderboard() {
    this.navCtrl.navigateForward('/leaderboard');
  }
  
  logOut() {
    this.navCtrl.navigateRoot('/account-details'); 
  }
  
  goBackToMainMenu() {
    this.navCtrl.navigateBack('/mainmenu');
  }
}