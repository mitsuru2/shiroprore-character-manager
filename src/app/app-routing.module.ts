import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppNavigateService } from './services/app-navigate/app-navigate.service';

const routes: Routes = [
  {
    path: 'main',
    loadChildren: () => import('./modules/main/main.module').then((m) => m.MainModule),
    canLoad: [AppNavigateService],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
