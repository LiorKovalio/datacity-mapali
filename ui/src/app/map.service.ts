import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import * as mapboxgl from 'mapbox-gl';
@Injectable({
  providedIn: 'root'
})
export class MapService {

  ACCESS_TOKEN = 'pk.eyJ1IjoiZGF0YWNpdHktbWFwYWxpIiwiYSI6ImNsYmFmbjdnNzA0NWEzcnA2OXI2cDdqcjkifQ.tpgQZwq_hH6dNMWYaTaCaA';

  constructor() {
    console.log('MAPBOX SERVICE INIT');
    (mapboxgl.accessToken as any) = this.ACCESS_TOKEN;
    mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      (error: any) => {
        console.log('FAILED TO LOAD PLUGIN', error);
      },
      true // Lazy load the plugin
    );  
  } 
}
