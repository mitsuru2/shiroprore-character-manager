import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-dynamic-help',
  templateUrl: './dynamic-help.component.html',
  styleUrls: ['./dynamic-help.component.scss'],
})
export class DynamicHelpComponent implements OnInit {
  path = '';

  tabIndex = 0;

  constructor(private logger: NGXLogger, private navigator: NavigatorService) {}

  ngOnInit(): void {
    this.path = this.navigator.currentPath;
  }
}
