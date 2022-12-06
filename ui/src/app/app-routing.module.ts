import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { MapComponent } from './map/map.component';

const routes: Routes = [
  { path: 'new', component: EditorComponent },
  { path: '/m/:id', component: MapComponent },
  { path: '', redirectTo: '/new', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
