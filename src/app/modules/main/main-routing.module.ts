import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { LegalComponent } from './components/legal/legal.component';
import { LoginComponent } from './components/login/login.component';
import { NavigatorService } from './services/navigator/navigator.service';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'list-character', pathMatch: 'full' },
      { path: 'new-character', component: NewCharacterComponent },
      { path: 'list-character', component: ListCharacterComponent },
      { path: 'legal', component: LegalComponent },
      { path: 'login', component: LoginComponent },
    ],
    canActivateChild: [NavigatorService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
