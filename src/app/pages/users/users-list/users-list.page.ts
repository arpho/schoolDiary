import { Component, computed, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonLabel
} from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import {
   create,
   close,
   save,
   trash,
   ellipsisVertical } from 'ionicons/icons';
import { Router } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ClassiService } from '../../classes/services/classi.service';
import { ClasseModel } from '../../classes/models/classModel';

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
    FormsModule,
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
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonLabel
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsersListPage implements OnInit, OnDestroy {
deleteUser(userKey: string) {
console.log("deleteUser", userKey);
}
editUser(userKey: string) {
  this.router.navigate(['user-dialog',userKey]);
}

  userList= signal<UserModel[]>([]);
  usersFilter= signal<()=> UserModel[]>(()=>this.userList());
  users2BeShown= computed(()=>this.usersFilter()().sort((a,b)=>this.factoryName(a).localeCompare(this.factoryName(b))));
  classes= signal<ClasseModel[]>([]);
  filterUserForm!: FormGroup;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly usersService: UsersService,
    private readonly router: Router,
    private readonly toaster: ToasterService,
    private readonly fb: FormBuilder,
    private readonly classesService: ClassiService
  ) {
    addIcons({
      ellipsisVertical,
      create,
      close,
      save,
      trash,
    });

    // Sottoscrizione per il caricamento delle classi
    this.classesService.getClassiOnRealtime((classi) => {
      console.log('Classi ricevute dal servizio:', classi);
      this.classes.set(classi);
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.filterUserForm = this.fb.group({
      searchTerm: [''],
      selectedClass: ['']
    });

    // Sottoscrizione ai cambiamenti del form
    this.filterUserForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((values) => this.applyFilter(values));
  }

  applyFilter(values: { searchTerm: string; selectedClass: string }) {
    const searchTerm = values?.searchTerm?.toLowerCase() || '';
    const selectedClass = values?.selectedClass || '';
    
    this.usersFilter.set(() => {
      let filteredUsers = this.userList();
      
      // Filtro per testo
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
          user.firstName?.toLowerCase().includes(searchTerm) || 
          user.lastName?.toLowerCase().includes(searchTerm) ||
          this.factoryName(user).toLowerCase().includes(searchTerm)
        );
      }
      
      // Filtro per classe
      if (selectedClass) {
        filteredUsers = filteredUsers.filter(user => user.classKey === selectedClass);
      }
      
      return filteredUsers;
    });
  }

}
