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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { FieldsetModule } from 'primeng/fieldset';

/** Firebase modules. */
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FirebaseUIModule, firebase, firebaseui } from 'firebaseui-angular';
import { environment } from 'src/environments/environment';

/** Application components. */
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { LegalComponent } from './components/legal/legal.component';
import { LoginComponent } from './components/login/login.component';
import { CharacterComponent } from './components/character/character.component';
import { ListCharacterOwnershipComponent } from './components/list-character-ownership/list-character-ownership.component';
import { SupportComponent } from './components/support/support.component';
import { TeamComponent } from './components/team/team.component';
import { ListCharacterKaichikuComponent } from './components/list-character-kaichiku/list-character-kaichiku.component';
import { NavigatorService } from './services/navigator/navigator.service';
import { UserAuthService } from './services/user-auth/user-auth.service';
import { SpinnerService } from './services/spinner/spinner.service';
import { TopMenuComponent } from './views/top-menu/top-menu.component';
import { TopMenuMComponent } from './views/top-menu-m/top-menu-m.component';
import { SideMenuComponent } from './views/side-menu/side-menu.component';
import { NewCharacterFormComponent } from './views/new-character-form/new-character-form.component';
import { NewWeaponFormComponent } from './views/new-weapon-form/new-weapon-form.component';
import { NewFacilityFormComponent } from './views/new-facility-form/new-facility-form.component';
import { NewCharacterConfirmationComponent } from './views/new-character-confirmation/new-character-confirmation.component';
import { MakeThumbnailFormComponent } from './views/make-thumbnail-form/make-thumbnail-form.component';
import { CharacterFilterSettingsFormComponent } from './views/character-filter-settings-form/character-filter-settings-form.component';
import { CharacterSortSettingsFormComponent } from './views/character-sort-settings-form/character-sort-settings-form.component';
import { CopyrightNoticeComponent } from './views/copyright-notice/copyright-notice.component';
import { PrivacyPolicyComponent } from './views/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './views/terms-of-service/terms-of-service.component';
import { RemoveUserDataComponent } from './views/remove-user-data/remove-user-data.component';
import { CharacterFilterService } from './services/character-filter/character-filter.service';
import { InquiryFormComponent } from './views/inquiry-form/inquiry-form.component';
import { ReleaseHistoryComponent } from './views/release-history/release-history.component';
import { ReadMeComponent } from './views/read-me/read-me.component';
import { AnnounceComponent } from './views/announce/announce.component';
import { TeamViewComponent } from './views/team-view/team-view.component';
import { DynamicHelpComponent } from './views/dynamic-help/dynamic-help.component';

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
    ListCharacterOwnershipComponent,
    SupportComponent,
    InquiryFormComponent,
    ReleaseHistoryComponent,
    ReadMeComponent,
    AnnounceComponent,
    TeamComponent,
    TeamViewComponent,
    ListCharacterKaichikuComponent,
    DynamicHelpComponent,
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
    CalendarModule,
    CardModule,
    CheckboxModule,
    ChipsModule,
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    FieldsetModule,
    InputNumberModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
    MenuModule,
    PaginatorModule,
    PanelModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    TabViewModule,
  ],
  bootstrap: [MainComponent],
  providers: [CharacterFilterService, NavigatorService, SpinnerService, UserAuthService, ConfirmationService],
})
export class MainModule {}
