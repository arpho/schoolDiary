import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';
import { GroupModel } from '../../../models/groupModel';

@Component({
  selector: 'app-group-viewer',
  templateUrl: './group-viewer.component.html',
  styleUrls: ['./group-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupViewerComponent  implements OnInit {
  group = input.required<GroupModel>();
  linkedList = input.required<string[]>();

  constructor() { }

  ngOnInit() {}

}
