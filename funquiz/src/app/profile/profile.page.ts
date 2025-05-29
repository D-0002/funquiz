import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService, User } from '../../services/auth.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit, OnDestroy {
  editableUserName: string = '';
  originalUserName: string = '';
  isEditingUsername: boolean = false;
  userSex: string = 'PreferNotToSay';
  userProfilePictureUrl: string | null = null;
  defaultProfilePicture: string;
  
  private currentUserSubscription: Subscription | undefined;
  private currentUser: User | null = null;
  public isSaving: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    this.defaultProfilePicture = this.authService.getDefaultProfilePicture();
    this.userProfilePictureUrl = this.defaultProfilePicture;
  }

  ngOnInit() {
  this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
    this.currentUser = user;
    if (user) {
      this.originalUserName = user.username;
      this.editableUserName = user.username;
      this.userProfilePictureUrl = user.profile_picture_url || this.defaultProfilePicture;
      // Remove this line since sex doesn't exist on User
      // this.userSex = user.sex || 'PreferNotToSay'; 
    } else {
      this.editableUserName = '';
      this.originalUserName = '';
      this.userProfilePictureUrl = this.defaultProfilePicture;
      this.isEditingUsername = false;
    }
  });
}

  startEditUsername(): void {
    this.isEditingUsername = true;
  }

  cancelEditUsername(): void {
    this.editableUserName = this.originalUserName;
    this.isEditingUsername = false;
  }

  isUsernameChanged(): boolean {
    return this.editableUserName.trim() !== this.originalUserName.trim();
  }

  async confirmUsernameChange() {
    if (!this.isEditingUsername || this.isSaving) return;
    
    if (!this.currentUser) {
      this.presentToast('User not logged in.', 'danger');
      return;
    }

    const trimmedName = this.editableUserName.trim();
    
    if (!trimmedName) {
      this.presentToast('Username cannot be empty.', 'warning');
      this.cancelEditUsername();
      return;
    }

    if (!this.isUsernameChanged()) {
      this.isEditingUsername = false;
      return;
    }

    this.isSaving = true;

    try {
      const updatedUser = await firstValueFrom(
        this.authService.updateUserProfile(this.currentUser.id, trimmedName)
      );
      
      this.originalUserName = updatedUser.username;
      this.editableUserName = updatedUser.username;
      this.presentToast('Username updated successfully!', 'success');
    } catch (error: any) {
      this.editableUserName = this.originalUserName;
      this.presentToast(
        error?.message || 'Error updating profile. Please try again.', 
        'danger'
      );
    } finally {
      this.isSaving = false;
      this.isEditingUsername = false;
    }
  }

  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.currentUser) return;

    const file = input.files[0];
    
    if (!file.type.startsWith('image/')) {
      this.presentToast('Please select an image file', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.presentToast('File too large (max 5MB)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.userProfilePictureUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    await this.uploadProfilePicture(file);
    input.value = '';
  }

  private async uploadProfilePicture(file: File) {
    if (!this.currentUser) return;
    
    try {
      const updatedUser = await firstValueFrom(
        this.authService.updateProfilePicture(this.currentUser.id, file)
      );
      this.userProfilePictureUrl = updatedUser.profile_picture_url || this.defaultProfilePicture;
      this.presentToast('Profile picture updated!', 'success');
    } catch (error) {
      this.presentToast('Failed to upload picture', 'danger');
      this.userProfilePictureUrl = this.currentUser.profile_picture_url || this.defaultProfilePicture;
    }
  }

  goToLeaderboard() {
    this.navCtrl.navigateForward('/leaderboard');
  }

  logOut() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/account-details');
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  ngOnDestroy() {
    this.currentUserSubscription?.unsubscribe();
  }
}