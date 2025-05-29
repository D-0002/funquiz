import { Routes } from '@angular/router';
import { authGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'account',
    loadComponent: () => import('./pages/account/account.page').then( m => m.AccountPage)
  },
  {
    path: 'account-details',
    loadComponent: () => import('./pages/account-details/account-details.page').then( m => m.AccountDetailsPage),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage)
  },
  {
    path: 'how-to-play',
    loadComponent: () => import('./pages/how-to-play/how-to-play.page').then( m => m.HowToPlayPage)
  },
  {
    path: 'mainmenu',
    loadComponent: () => import('./pages/mainmenu/mainmenu.page').then(m => m.MainmenuPage),
    canActivate: [authGuard]
  },
  {
    path: 'play',
    loadComponent: () => import('./play/play.page').then( m => m.PlayPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage),
    canActivate: [authGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./leaderboard/leaderboard.page').then( m => m.LeaderboardPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'easy',
    loadComponent: () => import('./play/easy/easy.page').then( m => m.EasyPage),
    canActivate: [authGuard]
  },
  {
    path: 'medium',
    loadComponent: () => import('./play/medium/medium.page').then( m => m.MediumPage),
    canActivate: [authGuard]
  },
  {
    path: 'hard',
    loadComponent: () => import('./play/hard/hard.page').then( m => m.HardPage),
    canActivate: [authGuard]
  },
  {
    path: 'extreme',
    loadComponent: () => import('./play/extreme/extreme.page').then( m => m.ExtremePage),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'welcome'
  }
];