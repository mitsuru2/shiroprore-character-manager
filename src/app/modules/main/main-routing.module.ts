import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppNavigateService } from 'src/app/services/app-navigate/app-navigate.service';
import { LegalComponent } from './components/legal/legal.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { LoginComponent } from './components/login/login.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { MainComponent } from './main.component';

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
    canActivateChild: [AppNavigateService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
