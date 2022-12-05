import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { DrawerComponent } from './drawer/drawer.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { DgpOauth2Module } from 'dgp-oauth2-ng';
import { FormsModule } from '@angular/forms';
import { EtlServerModule } from 'etl-server';
import { StageSourceComponent } from './stage-source/stage-source.component';
import { environment } from '../environments/environment';
import { StageMappingComponent } from './stage-mapping/stage-mapping.component';
import { ColumnTypeTagComponent } from './column-type-tag/column-type-tag.component';
import { EditorComponent } from './editor/editor.component';
import { StageMetadataComponent } from './stage-metadata/stage-metadata.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    DrawerComponent,
    LoginComponent,
    StageSourceComponent,
    StageMappingComponent,
    ColumnTypeTagComponent,
    EditorComponent,
    StageMetadataComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    DgpOauth2Module,
    EtlServerModule.forRoot(environment),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
