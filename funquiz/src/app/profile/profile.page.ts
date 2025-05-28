import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'; // Import ViewChild and ElementRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular'; // Removed ActionSheetController
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
  userName: string = '';
  userSex: string = 'Male';
  userProfilePictureUrl: string | null = null;
  defaultProfilePicture: string;

  private currentUserSubscription: Subscription | undefined;
  private currentUser: User | null = null;

  // Reference to the hidden file input element
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
        this.userName = user.username;
        this.userProfilePictureUrl = user.profile_picture_url || this.defaultProfilePicture;
      } else {
        this.userName = '';
        this.userProfilePictureUrl = this.defaultProfilePicture;
        // Consider redirecting to login if no user is found after a brief delay
        // to allow auth service to initialize.
        // setTimeout(() => {
        //   if (!this.authService.currentUserValue) {
        //     this.navCtrl.navigateRoot('/account-details');
        //   }
        // }, 500);
      }
    });
  }

  // Method to trigger the hidden file input when avatar or button is clicked
  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  // Handles file selected from <input type="file">
  async onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0 && this.currentUser) {
      const file = inputElement.files[0];

      // Basic client-side validation (optional, but good practice)
      if (!file.type.startsWith('image/')) {
          this.presentToast('Please select an image file (e.g., JPG, PNG, GIF).', 'warning');
          inputElement.value = ''; // Clear the input
          return;
      }
      if (file.size > 5 * 1024 * 1024) { // Example: 5MB limit
          this.presentToast('File is too large. Maximum size is 5MB.', 'warning');
          inputElement.value = ''; // Clear the input
          return;
      }

      // Preview the image immediately
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfilePictureUrl = e.target.result; // Show base64 preview
      };
      reader.readAsDataURL(file);

      await this.uploadProfilePicture(file);
      // Clear the input value so the 'change' event fires if the user selects the same file again
      inputElement.value = '';
    }
  }

  private async uploadProfilePicture(file: File) {
    if (!this.currentUser) {
      this.presentToast('User not logged in.', 'danger');
      return;
    }
    try {
      const updatedUser = await firstValueFrom(
        this.authService.updateProfilePicture(this.currentUser.id, file)
      );
      // The authService should update the currentUser BehaviorSubject,
      // which will trigger the subscription in ngOnInit to update the view.
      // For an even more immediate update of the URL from the server:
      if (updatedUser && updatedUser.profile_picture_url) {
         this.userProfilePictureUrl = updatedUser.profile_picture_url;
      }
      this.presentToast('Profile picture updated successfully!', 'success');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error?.message || error?.error?.error || 'Error uploading picture. Please try again.';
      this.presentToast(errorMessage, 'danger');
      // Revert to the picture that was set before attempting upload
      // (which could be the preview or the old server URL)
      // A safer revert would be to re-fetch the user details or use the last known good URL from this.currentUser
      if (this.currentUser && this.currentUser.profile_picture_url) {
        this.userProfilePictureUrl = this.currentUser.profile_picture_url;
      } else {
        this.userProfilePictureUrl = this.defaultProfilePicture;
      }
    }
  }

  goToLeaderboard() {
    this.navCtrl.navigateForward('/leaderboard');
  }

  logOut() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/account-details');
  }

  goBackToMainMenu() {
    this.navCtrl.navigateBack('/mainmenu');
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  ngOnDestroy() {
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }
}