import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
