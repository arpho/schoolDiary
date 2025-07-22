import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonInput, IonDatetime, IonButton, IonBackButton, IonButtons, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonDatetime,
    IonButton,
    IonBackButton,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonButtons,
    IonSelect,
    IonSelectOption
  ]
})
export class ProfilePage implements OnInit {
  private userKey = signal<string>('');
  private user = signal<UserModel | null>(null);
  listaClassi = signal<ClasseModel[]>([]);
  isClassSelectionEnabled = signal<boolean>(false);
  profileForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private $user: UsersService,
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private classiService: ClassiService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', []],
      phoneNumber: ['', [Validators.pattern('^[0-9]*$')]],
      userName: ['', []],
      classKey: ['', []]
    });
  }

  ngOnInit() {
    this.userKey.set(this.route.snapshot.paramMap.get('userKey')!);
    console.log("userKey", this.userKey());

    // Fetch class list
    this.classiService.getClassiOnRealtime((classi) => {
      this.listaClassi.set(classi);
      console.log('Classi caricate:', this.listaClassi());
    });

    this.$user.fetchUser(this.userKey()).then((user: UserModel|null) => {
      if(user){
        this.user.set(user);
        this.isClassSelectionEnabled.set(user.role === UsersRole.ADMIN);
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          birthDate: user.birthDate,
          phoneNumber: user.phoneNumber,
          userName: user.userName,
          classKey: user.classKey
        });
      }
      console.log("user", this.user());
    });
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      const updatedUser = new UserModel();
      Object.assign(updatedUser, this.profileForm.value);

      try {
        await this.$user.updateUser(this.userKey(), updatedUser);
        await this.presentToast('Profilo aggiornato con successo!', 'success');
      } catch (error: any) {
        console.error('Error updating profile:', error);
        await this.presentToast('Errore durante l\'aggiornamento del profilo', 'danger');
      }
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger') {
    await this.toasterService.showToast({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
  }
}
