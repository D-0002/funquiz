import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-mainmenu',
  imports: [CommonModule, IonicModule],
  templateUrl: './mainmenu.page.html',
  styleUrls: ['./mainmenu.page.scss']
})
export class MainmenuPage {
  constructor(private router: Router) {}

  goTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  logout() {
    console.log('User logged out');
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/account-details']);
  }
  
}
