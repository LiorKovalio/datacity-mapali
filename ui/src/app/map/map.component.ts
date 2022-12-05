import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from 'etl-server';
import { catchError, from, map, ReplaySubject, switchMap } from 'rxjs';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { PublisherService } from '../publisher.service';
import { MapService } from '../map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements AfterViewInit, OnChanges {

  STYLE = 'mapbox://styles/datacity-mapali/clbah6801003614miwkl1wzek';

  @Input() mapConfig: any;
  ready = false;
  processing = false
  
  @ViewChild('map') mapEl: any;
  id = new ReplaySubject<string>(1);
  lastId: string;
  map: mapboxgl.Map | null = null;

  title: string | null = null;
  description: string | null = null;
  contact: string | null = null;
  contactUrl: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private publisher: PublisherService, private mapService: MapService) {
    this.route.params.subscribe((params: any) => {
      console.log('params', params);
      if (params.id) {
        this.id.next(params.id);
      }
    });
    publisher.status.subscribe((status) => {
      if (status === 'ready') {
        this.ready = true;
      }
      if (status === 'processing') {
        this.processing = true;
      }
      if (status === 'done') {
        this.router.navigate(['/', this.lastId]);
      }
    })
  }

  ngOnChanges(): void {
    if (this.mapConfig && this.mapConfig.mapPath) {
      this.id.next(this.mapConfig.mapPath);
    }
  }

  ngAfterViewInit(): void {
    if (this.map === null) {
      const mapParams: mapboxgl.MapboxOptions = {
        container: this.mapEl.nativeElement,
        style: this.STYLE,
        minZoom: 3,
        attributionControl: false,
        center: [34.9, 32],
        zoom: 8.5,
      };
      this.map = new mapboxgl.Map(mapParams);
      this.map.addControl(new mapboxgl.AttributionControl(), 'top-right');
      this.map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-left');
      this.map.dragRotate.disable();
      this.map.touchZoomRotate.disableRotation();
      this.map.touchPitch.disable();
  
      this.map.on('load', () => {
        this.id.pipe(
          switchMap((id) => {
            console.log('MAP NEW ID', id);
            return this.http.get(`https://storage.googleapis.com/mapali-data/${id}/datapackage.json`).pipe(
              map((data: any) => {
                console.log('DATAPACKAGE', data);
                this.title = data.title;
                this.description = data.description;
                this.contact = data.contact;
                this.contactUrl = data.contactUrl;
                return {
                  bounds: data.bounds,
                  id: id
                };
              }),
              catchError((err) => {
                console.log('ERROR', err);
                return from([{
                  bounds: null,
                  id: null
                }]);
              })
            );
          }),
        ).subscribe(({bounds, id}) => {
          if (id && this.map) {
            this.lastId = id;
            const source = this.map.getSource('mapali_source') as mapboxgl.GeoJSONSource;
            if (source) {
              source.setData({type: 'FeatureCollection', features: []});
            }
            if (!source) {
              this.map.addSource('mapali_source', {
                type: 'geojson',
                data: `https://storage.googleapis.com/mapali-data/${id}/data.geojson`
              });
              console.log('ADDING SOURCE', `https://storage.googleapis.com/mapali-data/${id}/data.geojson`);
              const style = this.map.getStyle();
              const layers = style.layers;
              for (const layerIndex_ in layers) {
                const layerIndex = parseInt(layerIndex_, 10);
                const layer = layers[layerIndex];
                if (layer.id.indexOf('mapali') === 0) {
                  console.log('FIXING LAYER', layer.id);
                  const layerDef: any = layers[layerIndex];
                  const before = layers[layerIndex + 1] && layers[layerIndex + 1].id;          
                  this.map.removeLayer(layer.id);
                  this.map.addLayer({
                    id: layer.id,
                    type: layerDef.type,
                    source: 'mapali_source',
                    layout: layerDef.layout || {},
                    paint: layerDef.paint || {}
                  }, before);
                  this.map.setFilter(layer.id, null);          
                }
              }
              console.log('MAP FIT BOUNDS', bounds);
              this.map.fitBounds(bounds, {padding: {bottom: 20, top: 120, left: 20, right: 20}});
            } else {
              source.setData(`https://storage.googleapis.com/mapali-data/${id}/data.geojson`);
            }
          }
        });
      });
    }
  }

  process() {
    if (!this.processing) {
      this.publisher.status.next('processing');
    }
  }
}
