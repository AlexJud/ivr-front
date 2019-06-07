import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

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
import { TreeComponent } from './tree/tree.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {ModelService} from './services/model.service';
import {EventService} from './services/event.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GridToolbarComponent,
    CallButtonComponent,
    MxGraphComponent,
    TreeComponent
  ],
  imports: [
    BrowserModule,
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
    MatCheckboxModule
  ],
  providers: [ ModelService, EventService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
