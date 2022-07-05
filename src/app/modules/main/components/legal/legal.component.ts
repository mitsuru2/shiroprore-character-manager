import { Component } from '@angular/core';
import { AppInfo } from 'src/app/app-info.enum';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class LegalComponent /*implements OnInit*/ {
  appInfo = AppInfo;
}
