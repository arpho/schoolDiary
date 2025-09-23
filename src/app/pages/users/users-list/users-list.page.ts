import { Component, computed, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonList,
  IonItem,
  IonFab,
  IonFabButton,
  IonFabList,
  IonBackButton,
  IonSearchbar
} from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import {
   add,
   create,
   close,
   save,
   trash,
   ellipsisVertical } from 'ionicons/icons';
import { Router } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    IonItem,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonList,
    IonFab,
    IonFabButton,
    IonFabList,
    IonBackButton,
    IonSearchbar
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsersListPage implements OnInit {
deleteUser(userKey: string) {
console.log("deleteUser", userKey);
}
editUser(userKey: string) {
  this.router.navigate(['user-dialog',userKey]);
}

  userList= signal<UserModel[]>([]);
  usersFilter= signal<()=> UserModel[]>(()=>this.userList());
  users2BeShown= computed(()=>this.usersFilter()().sort((a,b)=>this.factoryName(a).localeCompare(this.factoryName(b))));

  filterUserForm!: FormGroup;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private toaster: ToasterService,
    private readonly fb: FormBuilder
  ) {
    addIcons({
      ellipsisVertical,
      create,
      close,
      save,
      trash,
    });
  }

  private factoryName(user: UserModel): string {
    return `${user.lastName || ''} ${user.firstName || ''}`.trim();
  }

  ngOnInit() {
    this.initializeForm();
    
    const cb = (users: UserModel[]) => {
      this.userList.set(users);
    };
    this.usersService.getUsersOnRealTime(cb);
  }

  private initializeForm() {
    this.filterUserForm = this.fb.group({
      searchTerm: ['']
    });

    this.filterUserForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((values) => this.applyFilter(values));
  }

  applyFilter(values: string) {
    const searchTerm = values?.toLowerCase() || '';
    
    if (!searchTerm) {
      this.usersFilter.set(() => this.userList().filter(user => this.factoryName(user).toLowerCase().includes(searchTerm)));
      return;
    }

    this.usersFilter.set(() => 
      this.userList().filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm) || 
        user.lastName?.toLowerCase().includes(searchTerm) ||
        this.factoryName(user).toLowerCase().includes(searchTerm)
      )
    );
  }

}
