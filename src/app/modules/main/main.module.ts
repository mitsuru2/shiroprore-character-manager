import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** PrimeNG modules. */
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
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
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';

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

/** Firebase modules. */
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FirebaseUIModule, firebase, firebaseui } from 'firebaseui-angular';
import { environment } from 'src/environments/environment';
import { NavigatorService } from './services/navigator/navigator.service';
import { UserAuthService } from './services/user-auth/user-auth.service';
import { CharacterComponent } from './components/character/character.component';
import { CharacterFilterSettingsFormComponent } from './views/character-filter-settings-form/character-filter-settings-form.component';
import { SpinnerService } from './services/spinner/spinner.service';
import { CharacterSortSettingsFormComponent } from './views/character-sort-settings-form/character-sort-settings-form.component';
import { CopyrightNoticeComponent } from './views/copyright-notice/copyright-notice.component';
import { PrivacyPolicyComponent } from './views/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './views/terms-of-service/terms-of-service.component';
import { RemoveUserDataComponent } from './views/remove-user-data/remove-user-data.component';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  autoUpgradeAnonymousUsers: false, // Disable annymouse users.
  signInFlow: 'redirect', // redirect or popup
  signInOptions: [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //requireDisplayName: false,
    },
  ],
  privacyPolicyUrl: 'https://shiroprore-character.web.app/main/legal/privacy',
  tosUrl: 'https://shiroprore-character.web.app/main/legal/tos',
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
    CharacterComponent,
    CharacterFilterSettingsFormComponent,
    CharacterSortSettingsFormComponent,
    CopyrightNoticeComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    RemoveUserDataComponent,
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
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    InputNumberModule,
    InputSwitchModule,
    InputTextModule,
    MenuModule,
    PaginatorModule,
    PanelModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    TabViewModule,
  ],
  bootstrap: [MainComponent],
  providers: [NavigatorService, UserAuthService, ConfirmationService, SpinnerService],
})
export class MainModule {}
