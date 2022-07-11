import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './components/error/error.component';
import { StartUpComponent } from './components/start-up/start-up.component';

const routes: Routes = [
  {
    path: '',
    component: StartUpComponent,
  },
  {
    path: 'main',
    loadChildren: () => import('./modules/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'error/:error',
    component: ErrorComponent,
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
