import { Component, OnInit, signal, inject, ChangeDetectorRef, computed } from '@angular/core';
import { UserModel } from 'src/app/shared/models/userModel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSelect, IonSelectOption, IonButtons, IonButton } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { ActivatedRoute } from '@angular/router';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { Evaluation } from '../../models/evaluation';

import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ChartModule, IonSelect, IonSelectOption, IonButtons, IonButton]
})
export class ProgressPage implements OnInit {

  studentKey = signal("");
  teacherKey = signal("");
  student = signal<UserModel | null>(null); // Signal to store the full student object

  // Data for the chart
  data = signal<any>(null);
  options = signal<any>(null);

  // Subjects handling
  subjects = signal<SubjectModel[]>([]); // List of SubjectModel
  selectedSubject = signal<string | null>(null);

  selectedSubjectName = computed(() => {
    const selected = this.selectedSubject();
    if (!selected) return '';
    const subject = this.subjects().find(s => s.key === selected);
    return subject ? subject.name : '';
  });

  // Dependencies
  private route = inject(ActivatedRoute);
  private evaluationService = inject(EvaluationService);
  private usersService = inject(UsersService);
  private subjectService = inject(SubjectService);
  private cdr = inject(ChangeDetectorRef); // Import ChangeDetectorRef

  constructor() {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    // 1. Get Student Key from Route
    this.studentKey.set(this.route.snapshot.paramMap.get('studentKey') || "");
    const routeSubject = this.route.snapshot.paramMap.get('subjectsKey'); // Note: 'subjectsKey' based on routes.ts

    // 2. Get Logged Teacher Key
    const loggedUser = await this.usersService.getLoggedUser();
    if (loggedUser) {
      this.teacherKey.set(loggedUser.key);
    }

    if (this.studentKey() && this.teacherKey()) {
      // Fetch subjects
      await this.loadSubjects();
      await this.loadEvaluations(routeSubject);
    }

    this.initChartOptions();
  }

  async loadSubjects() {
    const student = await this.usersService.fetchUser(this.studentKey());
    if (student) {
      this.student.set(student); // Store student details

      // Collect all class keys for the student
      const classKeys = new Set<string>();
      if (student.classKey) classKeys.add(student.classKey);
      if (student.classes && student.classes.length > 0) {
        student.classes.forEach(k => classKeys.add(k));
      }

      const teacher = await this.usersService.getLoggedUser();
      if (!teacher || !teacher.assignedClasses) return;

      const allSubjectKeys: string[] = [];

      // Iterate over student's classes and find matches in teacher's assignedClasses
      for (const classKey of classKeys) {
        const assignedClass = teacher.assignedClasses.find(ac => ac.key === classKey);
        if (assignedClass && assignedClass.subjectsKey) {
          allSubjectKeys.push(...assignedClass.subjectsKey);
        }
      }

      if (allSubjectKeys.length > 0) {
        const uniqueKeys = Array.from(new Set(allSubjectKeys));
        const subjects = await this.subjectService.fetchSubjectsByKeys(uniqueKeys);
        this.subjects.set(subjects);
      }
    }
  }

  async loadEvaluations(preselectedSubject: string | null) {
    this.evaluationService.getEvaluation4studentAndTeacher(
      this.studentKey(),
      this.teacherKey(),
      (evaluations: Evaluation[]) => {
        this.processEvaluations(evaluations, preselectedSubject);
      }
    );
  }

  processEvaluations(evaluations: Evaluation[], preselectedSubject: string | null) {
    // 2. Determine selected subject
    if (preselectedSubject && this.subjects().some(s => s.key === preselectedSubject)) {
      this.selectedSubject.set(preselectedSubject);
    } else if (this.subjects().length > 0 && !this.selectedSubject()) {
      this.selectedSubject.set(this.subjects()[0].key);
    }

    this.updateChartData(evaluations);
  }

  onSubjectChange(event: any) {
    this.selectedSubject.set(event.value);

    // Let's reload to be safe/simple for now, relying on the service cache.
    this.evaluationService.getEvaluation4studentAndTeacher(
      this.studentKey(),
      this.teacherKey(),
      (evaluations) => {
        this.updateChartData(evaluations);
      }
    );
  }

  updateChartData(evaluations: Evaluation[]) {
    if (!this.selectedSubject()) return;

    // Filter by subject
    let filtered = evaluations.filter(e => e.subjectKey === this.selectedSubject());

    // Filter by date >= September 1st of current academic year
    // Logic for academic year: If current month >= September (8), start year is this year. Else, last year.
    const now = new Date();
    let startYear = now.getFullYear();
    if (now.getMonth() < 8) { // Jan(0) to Aug(7)
      startYear = startYear - 1;
    }
    const cutoffDate = `${startYear}-09-01`; // ISO string comparison should work for yyyy-mm-dd

    filtered = filtered.filter(e => e.data >= cutoffDate);

    // Sort by date
    filtered.sort((a, b) => a.data.localeCompare(b.data));

    // Prepare Chart Data
    // Labels: Dates (e.g. DD/MM)
    const labels = filtered.map(e => {
      const dateParts = e.data.split('-'); // assuming yyyy-mm-dd
      return `${dateParts[2]}/${dateParts[1]}`;
    });

    const grades = filtered.map(e => e.gradeInDecimal);

    this.data.set({
      labels: labels,
      datasets: [
        {
          label: 'Voti',
          data: grades,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4
        }
      ]
    });
    this.cdr.detectChanges();
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options.set({
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          },
          min: 0,
          max: 10
        }
      }
    });
  }

}
