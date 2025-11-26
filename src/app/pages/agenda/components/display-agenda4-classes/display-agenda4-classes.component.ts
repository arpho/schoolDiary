import { Component, ChangeDetectionStrategy, effect, input, OnInit, signal } from '@angular/core';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { AgendaEvent } from '../../models/agendaEvent';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';

@Component({
  selector: 'app-display-agenda4-classes',
  templateUrl: './display-agenda4-classes.component.html',
  styleUrls: ['./display-agenda4-classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DisplayAgenda4ClassesComponent implements OnInit {
  targetedClasses = input.required<string[]>();
  title = signal<string>('');
  agenda = signal<AgendaEvent[]>([])
  classes: any;
  listaClassi = signal<ClasseModel[]>([]);

  constructor(
    private $classes: ClassiService,
    private $agenda: AgendaService
  ) {
  }

  ngOnInit() {
    this.classes = effect(async () => {
      const targetedClasses = this.targetedClasses();
      console.log("classi target", targetedClasses);
      if (targetedClasses.length > 0 && targetedClasses[0]) {
        console.log("got classi target", targetedClasses);
      }
      const classPromises = targetedClasses.map((classKey) => {
        console.log("classKey", classKey);
        if (!this.$classes) {
          throw new Error('ClassiService non inizializzato');
        }
        return this.$classes.fetchClasseOnCache(classKey);
      });
      const classes = await Promise.all(classPromises);

      console.log("classi", classes);
      const title = classes.length > 1 ?
        `agenda per le classi: ${classes.map((classe) => classe?.classe).join(', ')}` : `agenda per ${classes[0]?.classe}`;
      this.title.set(title);
      this.$agenda.getAgenda4targetedClassesOnrealtime(targetedClasses, (events: AgendaEvent[]) => {
        console.log("events", events);
        this.agenda.set(events);
      });
    });
  }

}
