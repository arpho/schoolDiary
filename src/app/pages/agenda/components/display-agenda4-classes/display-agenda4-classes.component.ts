import { Component, ChangeDetectionStrategy, effect, input, OnInit, inject, signal } from '@angular/core';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { AgendaEvent } from '../../models/agendaEvent';
import { AgendaService } from 'src/app/shared/services/agenda.service';

@Component({
  selector: 'app-display-agenda4-classes',
  templateUrl: './display-agenda4-classes.component.html',
  styleUrls: ['./display-agenda4-classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DisplayAgenda4ClassesComponent {
  targetedClasses = input.required<string[]>();
  title = signal<string>('');
  agenda = signal<AgendaEvent[]>([])
  $agenda = inject(AgendaService)
  $classes = inject(ClassiService)
  classes: any;

  constructor() {
    this.classes = effect(() => {
      const targetedClasses = this.targetedClasses();
      console.log("classi target", targetedClasses);
      const classes = targetedClasses.map((classKey) => {
        return this.$classes.fetchClasseOnCache(classKey);
      });

      console.log("classi", classes);
      const title = classes.length > 1 ? `agenda per le classi: ${classes.map((classe) => classe?.classe).join(', ')}` : `agenda per ${classes[0]?.classe}`;
      this.title.set(title);
      this.$agenda.getAgenda4targetedClassesOnrealtime(targetedClasses, (events: AgendaEvent[]) => {
        console.log("events", events);
        this.agenda.set(events);
      });
    });
  }

}
