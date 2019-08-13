import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
// import { RingButtonComponent } from './ring-button/ring-button.component';
// import { MxGraphComponent } from './mx-graph/mx-graph.component';
// import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule, MatSidenavModule, MatIconModule, MatListModule } from '@angular/material';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTreeModule } from '@angular/material/tree';
import { HeaderComponent } from './header/header.component';
import { GridToolbarComponent } from './grid-toolbar/grid-toolbar.component';
import { CallButtonComponent } from './call-button/call-button.component';
import { MxGraphComponent } from './mx-graph/mx-graph.component';
// import { TreeComponent } from './tree/tree.component';
import { TreePanelComponent } from './tree/tree-panel/tree-panel.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ModelService } from './services/model.service';
import { EventService } from './services/event.service';
import { GridSettingsComponent } from './grid-settings/grid-settings.component';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from '../material-modules'
import { FormsModule } from '@angular/forms';
import { GridSettingsPanelComponent } from './grid-settings/grid-settings-panel/grid-settings-panel.component';
import { HttpService } from './services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { GrammarService } from './services/grammar.service';
import { SettingsModelService } from './services/build.settings.model.service';
import { Routes, RouterModule } from '@angular/router';
import { WebSocketAPI } from './services/WebSocketAPI';
import { CallViewerComponent } from './call-viewer/call-viewer.component';

// const appRoutes: Routes =[
//   { path: 'sidenav', component: SidnavTestComponent }
// ];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GridToolbarComponent,
    CallButtonComponent,
    MxGraphComponent,
    // TreeComponent,
    TreePanelComponent,
    GridSettingsComponent,
    GridSettingsPanelComponent,
    CallViewerComponent
  ],
  imports: [
    BrowserModule,
    // RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    MatToolbarModule,
    MatGridListModule,
    LayoutModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatTreeModule,
    MatCheckboxModule,
    MatTableModule,
    MaterialModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [ ModelService, EventService, HttpService, GrammarService, SettingsModelService, WebSocketAPI ],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule { }
