import { Component, computed, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionSheetController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonIcon,
  IonList,
  IonItem,
  IonBackButton,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonLabel
} from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import {
  create,
  close,
  save,
  trash,
  ellipsisVertical,
  school,
  easel,
  shieldHalf
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ClassiService } from '../../classes/services/classi.service';
import { ClasseModel } from '../../classes/models/classModel';

/**
 * Pagina che visualizza l'elenco degli utenti.
 * Permette di filtrare gli utenti per nome, classe e ruolo, e di gestirli (modifica/eliminazione).
 */
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
    IonIcon,
    IonList,
    IonBackButton,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonLabel
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsersListPage implements OnInit {
  private selectedUser: UserModel | null = null;

  async showUserActions(user: UserModel) {
    console.log("showUserActions", user);
    this.selectedUser = user;
    const actionSheet = await this.actionSheetController.create({
      header: `${user.lastName} ${user.firstName}`,
      subHeader: user.email,
      buttons: [
        {
          text: 'Modifica',
          icon: 'create',
          handler: () => {
            this.editUser(user.key);
          }
        },
        {
          text: 'Elimina',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteUser(user.key);
          }
        },
        {
          text: 'Annulla',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });

    await actionSheet.present();
  }

  deleteUser(userKey: string) {
    console.log("deleteUser", userKey);
    // Add your delete logic here
  }

  editUser(userKey: string) {
    this.router.navigate(['user-dialog', userKey]);
  }

  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly toaster = inject(ToasterService);
  private readonly fb = inject(FormBuilder);
  private readonly classesService = inject(ClassiService);
  private readonly actionSheetController = inject(ActionSheetController);

  userList = signal<UserModel[]>([]);
  classes = toSignal(this.classesService.getClassiOnRealtime(), { initialValue: [] });
  usersRole = UsersRole; // Make UsersRole available in template

  filterUserForm = this.fb.group({
    searchTerm: [''],
    selectedClass: [''],
    selectedRole: ['']
  });

  filterValues = toSignal(
    this.filterUserForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: { searchTerm: '', selectedClass: '', selectedRole: '' } }
  );

  users2BeShown = computed(() => {
    const list = this.userList();
    const values = this.filterValues();
    const searchTerm = values?.searchTerm?.toLowerCase() || '';
    const selectedClass = values?.selectedClass || '';
    const selectedRole = values?.selectedRole ? parseInt(values.selectedRole) : null;

    let filteredUsers = list;

    // Filtro per testo
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm) ||
        user.lastName?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        this.factoryName(user).toLowerCase().includes(searchTerm)
      );
    }

    // Filtro per classe
    if (selectedClass) {
      filteredUsers = filteredUsers.filter(user => user.classKey === selectedClass);
    }

    // Filtro per ruolo
    if (selectedRole !== null) {
      filteredUsers = filteredUsers.filter(user => user.role === selectedRole);
    }

    return [...filteredUsers].sort((a, b) => this.factoryName(a).localeCompare(this.factoryName(b)));
  });

  constructor() {
    addIcons({
      ellipsisVertical,
      create,
      close,
      save,
      trash,
      school,
      easel,
      shieldHalf
    });
  }

  private factoryName(user: UserModel): string {
    return `${user.lastName || ''} ${user.firstName || ''}`.trim();
  }

  ngOnInit() {
    const cb = (users: UserModel[]) => {
      this.userList.set(users);
    };
    this.usersService.getUsersOnRealTime(cb);
  }

  getRoleIcon(role: UsersRole): string {
    switch (role) {
      case UsersRole.STUDENT:
        return 'school';
      case UsersRole.TEACHER:
        return 'easel';
      case UsersRole.ADMIN:
        return 'shield-half';
      default:
        return 'person';
    }
  }

  getRoleLabel(role: UsersRole): string {
    switch (role) {
      case UsersRole.STUDENT:
        return 'Studente';
      case UsersRole.TEACHER:
        return 'Docente';
      case UsersRole.ADMIN:
        return 'Amministratore';
      default:
        return 'Utente';
    }
  }

  getRoleClass(role: UsersRole): string {
    switch (role) {
      case UsersRole.STUDENT:
        return 'role-student';
      case UsersRole.TEACHER:
        return 'role-teacher';
      case UsersRole.ADMIN:
        return 'role-admin';
      default:
        return 'role-unknown';
    }
  }

  getStudentClassName(classKey: string): string {
    if (!classKey) return 'Non assegnata';
    const found = this.classes().find(c => c.key === classKey);
    return found ? found.classe : 'Non assegnata';
  }

  getTeacherClassesNames(assignedClasses: any[]): string {
    if (!assignedClasses || assignedClasses.length === 0) {
      return 'Nessuna classe';
    }
    return assignedClasses
      .map(ac => {
        if (ac && ac.classe) return ac.classe;
        const key = ac && ac.key;
        if (key) {
          const found = this.classes().find(c => c.key === key);
          return found ? found.classe : '';
        }
        return '';
      })
      .filter(name => !!name)
      .join(', ') || 'Nessuna classe';
  }

}
