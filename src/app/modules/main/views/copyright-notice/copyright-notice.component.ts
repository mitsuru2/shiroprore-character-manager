import { Component } from '@angular/core';
import { AppInfo } from 'src/app/app-info.enum';

@Component({
  selector: 'app-copyright-notice',
  templateUrl: './copyright-notice.component.html',
  styleUrls: ['./copyright-notice.component.scss'],
})
export class CopyrightNoticeComponent {
  appInfo = AppInfo;
}
