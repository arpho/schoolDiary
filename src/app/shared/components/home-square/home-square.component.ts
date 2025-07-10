import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonImg } from "@ionic/angular/standalone";

@Component({
  selector: 'app-home-square',
  templateUrl: './home-square.component.html',
  styleUrls: ['./home-square.component.scss'],
  standalone: true,
  imports: [IonImg]
})
export class HomeSquareComponent  implements OnInit {
goTo() {
this.router.navigate([this.url])
}

  @Input({required:true})  title:string = ""
  @Input({required:true})  image:string = ""
  @Input({required:true})  url:string = ""
  constructor(private router:Router) { }

  ngOnInit() {

    console.log("init home square",this.title,this.url,this.image)
  }

}
