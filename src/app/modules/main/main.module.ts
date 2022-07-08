import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Firebase modules. */
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FirebaseUIModule, firebase, firebaseui } from 'firebaseui-angular';

/** PrimeNG modules. */
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';

/** Application components. */
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { LegalComponent } from './components/legal/legal.component';
import { LoginComponent } from './components/login/login.component';
import { TopMenuComponent } from './views/top-menu/top-menu.component';
import { TopMenuMComponent } from './views/top-menu-m/top-menu-m.component';
import { SideMenuComponent } from './views/side-menu/side-menu.component';
import { NewCharacterFormComponent } from './views/new-character-form/new-character-form.component';
import { NewWeaponFormComponent } from './views/new-weapon-form/new-weapon-form.component';
import { NewFacilityFormComponent } from './views/new-facility-form/new-facility-form.component';
import { NewCharacterConfirmationComponent } from './views/new-character-confirmation/new-character-confirmation.component';
import { MakeThumbnailFormComponent } from './views/make-thumbnail-form/make-thumbnail-form.component';
import { environment } from 'src/environments/environment';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  autoUpgradeAnonymousUsers: false, // Disable annymouse users.
  signInFlow: 'redirect', // redirect or popup
  signInOptions: [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //requireDisplayName: false,
    },
  ],
  privacyPolicyUrl: 'https://www.primefaces.org/primeng/',
  tosUrl: 'https://shiroprore-character.web.app',
  credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
  siteName: 'my-app',
};

@NgModule({
  declarations: [
    MainComponent,
    NewCharacterComponent,
    ListCharacterComponent,
    TopMenuComponent,
    SideMenuComponent,
    LegalComponent,
    NewCharacterFormComponent,
    NewWeaponFormComponent,
    NewFacilityFormComponent,
    NewCharacterConfirmationComponent,
    MakeThumbnailFormComponent,
    TopMenuMComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    AutoCompleteModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ChipsModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    MenuModule,
    PaginatorModule,
    PanelModule,
    ProgressSpinnerModule,
    RadioButtonModule,
  ],
  bootstrap: [MainComponent],
  providers: [],
})
export class MainModule {}
