import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonImg } from "@ionic/angular/standalone";

/**
 * Componente per i riquadri della dashboard (es. link rapidi).
 * Visualizza un'immagine, un titolo e naviga a un URL al click.
 */
@Component({
  selector: 'app-home-square',
  templateUrl: './home-square.component.html',
  styleUrls: ['./home-square.component.scss'],
  standalone: true,
  imports: [IonImg]
})
export class HomeSquareComponent implements OnInit {
  private router = inject(Router);

  /** Naviga all'URL specificato */
  goTo() {
    this.router.navigate([this.url])
  }

  @Input({ required: true }) title: string = ""
  @Input({ required: true }) image: string = ""
  @Input({ required: true }) url: string = ""

  ngOnInit() {

  }

}
