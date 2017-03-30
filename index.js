import * as maptalks from 'maptalks';
import mapboxgl from 'mapboxgl';

const options = {
    'renderer' : 'dom',
    'container' : 'back',
    'glOptions' : {
        'style' : 'mapbox://styles/mapbox/streets-v9'
    }
};

export class MapboxglLayer extends maptalks.Layer {
    /**
     * Reproduce a MapboxglLayer from layer's profile JSON.
     * @param  {Object} json - layer's profile JSON
     * @return {MapboxglLayer}
     * @static
     * @private
     * @function
     */
    static fromJSON(json) {
        if (!json || json['type'] !== 'MapboxglLayer') { return null; }
        const layer = new MapboxglLayer(json['id'], json['options']);
        return layer;
    }

    getGlMap() {
        const renderer = this._getRenderer();
        if (renderer) {
            return renderer.glmap;
        }
        return null;
    }

    /**
     * Export the MapboxglLayer's JSON.
     * @return {Object} layer's JSON
     */
    toJSON() {
        var json = {
            'type': this.getJSONType(),
            'id': this.getId(),
            'options': this.config()
        };
        return json;
    }
}

// merge to define MapboxglLayer's default options.
MapboxglLayer.mergeOptions(options);

// register MapboxglLayer's JSON type for JSON deserialization.
MapboxglLayer.registerJSONType('MapboxglLayer');

MapboxglLayer.registerRenderer('dom', class {

    constructor(layer) {
        this.layer = layer;
    }

    getMap() {
        if (!this.layer) {
            return null;
        }
        return this.layer.getMap();
    }

    show() {
        if (this._container) {
            this.render();
            this._show();
        }
    }

    hide() {
        if (this._container) {
            this._hide();
            this.clear();
        }
    }

    remove() {
        delete this.layer;
        if (this.glmap) {
            this.glmap.remove();
        }
        if (this._container) {
            maptalks.DomUtil.removeDomNode(this._container);
        }
        delete this._container;
        delete this.glmap;
    }

    clear() {
        if (this._container) {
            this._container.innerHTML = '';
        }
    }

    setZIndex(z) {
        this._zIndex = z;
        if (this._container) {
            this._container.style.zIndex = z;
        }
    }

    isCanvasRender() {
        return false;
    }

    render() {
        if (!this._container) {
            this._createLayerContainer();
        }
        if (!this.glmap) {
            const map = this.getMap();
            const center = map.getCenter();
            const options = maptalks.Util.extend({}, this.layer.options['glOptions'], {
                container: this._container,
                center: new mapboxgl.LngLat(center.x, center.y),
                zoom: map.getZoom() - 1
            });
            this.glmap = new mapboxgl.Map(options);
            this.glmap.on('load', () => {
                this.layer.fire('layerload');
            });
        }
    }

    getEvents() {
        return {
            '_zoomend _moving _moveend _pitch _rotate' : this.onEvent,
            '_zooming' : this.onZooming,
            'resize' : this.onResize
        };
    }

    onResize() {
        this._resize();
        this.onEvent();
    }

    onEvent() {
        if (this.glmap) {
            const map = this.getMap();
            const center = map.getCenter();
            const cameraOptions = {
                'center' : new mapboxgl.LngLat(center.x, center.y),
                'zoom'   : map.getZoom() - 1,
                'bearing' : map.getBearing(),
                'pitch' : map.getPitch()
            };
            this.glmap.jumpTo(cameraOptions);
        }
    }

    onZooming(param) {
        if (this.glmap) {
            const map = this.getMap();
            var origin = param['origin'];
            origin = map.containerPointToCoordinate(origin);
            origin = new mapboxgl.LngLat(origin.x, origin.y);
            const cameraOptions = {
                'around' : origin,
                'duration' : 0
            };
            this.glmap.zoomTo(map.getZoom() - 1, cameraOptions);
        }
    }

    _createLayerContainer() {
        var container = this._container = maptalks.DomUtil.createEl('div', 'maptalks-mapboxgllayer');
        container.style.cssText = 'position:absolute;';
        this._resize();
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        var parent = this.layer.options['container'] === 'front' ? this.getMap()._panels['frontStatic'] : this.getMap()._panels['backStatic'];
        parent.appendChild(container);
    }

    _resize() {
        const container = this._container;
        if (!container) {
            return;
        }
        const size = this.getMap().getSize();
        container.style.width = size['width'] + 'px';
        container.style.height = size['height'] + 'px';
    }

    _show() {
        this._container.style.display = '';
    }

    _hide() {
        this._container.style.display = 'none';
    }
});
