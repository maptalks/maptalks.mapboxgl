/*!
 * maptalks.mapboxgl v0.1.0
 * LICENSE : MIT
 * (c) 2016-2017 maptalks.org
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks'), require('mapboxgl')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks', 'mapboxgl'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks,global.mapboxgl));
}(this, (function (exports,maptalks,mapboxgl) { 'use strict';

mapboxgl = 'default' in mapboxgl ? mapboxgl['default'] : mapboxgl;

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var options = {
    'renderer': 'dom',
    'container': 'back',
    'glOptions': {
        'style': 'mapbox://styles/mapbox/streets-v9'
    }
};

var MapboxglLayer = function (_maptalks$Layer) {
    _inherits(MapboxglLayer, _maptalks$Layer);

    function MapboxglLayer() {
        _classCallCheck(this, MapboxglLayer);

        return _possibleConstructorReturn(this, _maptalks$Layer.apply(this, arguments));
    }

    /**
     * Reproduce a MapboxglLayer from layer's profile JSON.
     * @param  {Object} json - layer's profile JSON
     * @return {MapboxglLayer}
     * @static
     * @private
     * @function
     */
    MapboxglLayer.fromJSON = function fromJSON(json) {
        if (!json || json['type'] !== 'MapboxglLayer') {
            return null;
        }
        var layer = new MapboxglLayer(json['id'], json['options']);
        return layer;
    };

    MapboxglLayer.prototype.getGlMap = function getGlMap() {
        var renderer = this._getRenderer();
        if (renderer) {
            return renderer.glmap;
        }
        return null;
    };

    /**
     * Export the MapboxglLayer's JSON.
     * @return {Object} layer's JSON
     */


    MapboxglLayer.prototype.toJSON = function toJSON() {
        var json = {
            'type': this.getJSONType(),
            'id': this.getId(),
            'options': this.config()
        };
        return json;
    };

    return MapboxglLayer;
}(maptalks.Layer);

// merge to define MapboxglLayer's default options.
MapboxglLayer.mergeOptions(options);

// register MapboxglLayer's JSON type for JSON deserialization.
MapboxglLayer.registerJSONType('MapboxglLayer');

MapboxglLayer.registerRenderer('dom', function () {
    function _class(layer) {
        _classCallCheck(this, _class);

        this.layer = layer;
    }

    _class.prototype.getMap = function getMap() {
        if (!this.layer) {
            return null;
        }
        return this.layer.getMap();
    };

    _class.prototype.show = function show() {
        if (this._container) {
            this.render();
            this._show();
        }
    };

    _class.prototype.hide = function hide() {
        if (this._container) {
            this._hide();
            this.clear();
        }
    };

    _class.prototype.remove = function remove() {
        delete this.layer;
        if (this.glmap) {
            this.glmap.remove();
        }
        if (this._container) {
            maptalks.DomUtil.removeDomNode(this._container);
        }
        delete this._container;
        delete this.glmap;
    };

    _class.prototype.clear = function clear() {
        if (this._container) {
            this._container.innerHTML = '';
        }
    };

    _class.prototype.setZIndex = function setZIndex(z) {
        this._zIndex = z;
        if (this._container) {
            this._container.style.zIndex = z;
        }
    };

    _class.prototype.isCanvasRender = function isCanvasRender() {
        return false;
    };

    _class.prototype.render = function render() {
        var _this2 = this;

        if (!this._container) {
            this._createLayerContainer();
        }
        if (!this.glmap) {
            var map = this.getMap();
            var center = map.getCenter();
            var _options = maptalks.Util.extend({}, this.layer.options['glOptions'], {
                container: this._container,
                center: new mapboxgl.LngLat(center.x, center.y),
                zoom: map.getZoom() - 1
            });
            this.glmap = new mapboxgl.Map(_options);
            this.glmap.on('load', function () {
                _this2.layer.fire('layerload');
            });
        }
    };

    _class.prototype.getEvents = function getEvents() {
        return {
            '_zoomend _moving _moveend _pitch _rotate': this.onEvent,
            '_zooming': this.onZooming,
            'resize': this.onResize
        };
    };

    _class.prototype.onResize = function onResize() {
        this._resize();
        this.onEvent();
    };

    _class.prototype.onEvent = function onEvent() {
        if (this.glmap) {
            var map = this.getMap();
            var center = map.getCenter();
            var cameraOptions = {
                'center': new mapboxgl.LngLat(center.x, center.y),
                'zoom': map.getZoom() - 1,
                'bearing': map.getBearing(),
                'pitch': map.getPitch()
            };
            this.glmap.jumpTo(cameraOptions);
        }
    };

    _class.prototype.onZooming = function onZooming(param) {
        if (this.glmap) {
            var map = this.getMap();
            var origin = param['origin'];
            origin = map.containerPointToCoordinate(origin);
            origin = new mapboxgl.LngLat(origin.x, origin.y);
            var cameraOptions = {
                'around': origin,
                'duration': 0
            };
            this.glmap.zoomTo(map.getZoom() - 1, cameraOptions);
        }
    };

    _class.prototype._createLayerContainer = function _createLayerContainer() {
        var container = this._container = maptalks.DomUtil.createEl('div', 'maptalks-mapboxgllayer');
        container.style.cssText = 'position:absolute;';
        this._resize();
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        var parent = this.layer.options['container'] === 'front' ? this.getMap()._panels['frontStatic'] : this.getMap()._panels['backStatic'];
        parent.appendChild(container);
    };

    _class.prototype._resize = function _resize() {
        var container = this._container;
        if (!container) {
            return;
        }
        var size = this.getMap().getSize();
        container.style.width = size['width'] + 'px';
        container.style.height = size['height'] + 'px';
    };

    _class.prototype._show = function _show() {
        this._container.style.display = '';
    };

    _class.prototype._hide = function _hide() {
        this._container.style.display = 'none';
    };

    return _class;
}());

exports.MapboxglLayer = MapboxglLayer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwdGFsa3MubWFwYm94Z2wuanMiLCJzb3VyY2VzIjpbIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1hcHRhbGtzIGZyb20gJ21hcHRhbGtzJztcbmltcG9ydCBtYXBib3hnbCBmcm9tICdtYXBib3hnbCc7XG5cbmNvbnN0IG9wdGlvbnMgPSB7XG4gICAgJ3JlbmRlcmVyJyA6ICdkb20nLFxuICAgICdjb250YWluZXInIDogJ2JhY2snLFxuICAgICdnbE9wdGlvbnMnIDoge1xuICAgICAgICAnc3R5bGUnIDogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvc3RyZWV0cy12OSdcbiAgICB9XG59O1xuXG5leHBvcnQgY2xhc3MgTWFwYm94Z2xMYXllciBleHRlbmRzIG1hcHRhbGtzLkxheWVyIHtcbiAgICAvKipcbiAgICAgKiBSZXByb2R1Y2UgYSBNYXBib3hnbExheWVyIGZyb20gbGF5ZXIncyBwcm9maWxlIEpTT04uXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBqc29uIC0gbGF5ZXIncyBwcm9maWxlIEpTT05cbiAgICAgKiBAcmV0dXJuIHtNYXBib3hnbExheWVyfVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHN0YXRpYyBmcm9tSlNPTihqc29uKSB7XG4gICAgICAgIGlmICghanNvbiB8fCBqc29uWyd0eXBlJ10gIT09ICdNYXBib3hnbExheWVyJykgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgICBjb25zdCBsYXllciA9IG5ldyBNYXBib3hnbExheWVyKGpzb25bJ2lkJ10sIGpzb25bJ29wdGlvbnMnXSk7XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICBnZXRHbE1hcCgpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSB0aGlzLl9nZXRSZW5kZXJlcigpO1xuICAgICAgICBpZiAocmVuZGVyZXIpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlci5nbG1hcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgdGhlIE1hcGJveGdsTGF5ZXIncyBKU09OLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gbGF5ZXIncyBKU09OXG4gICAgICovXG4gICAgdG9KU09OKCkge1xuICAgICAgICB2YXIganNvbiA9IHtcbiAgICAgICAgICAgICd0eXBlJzogdGhpcy5nZXRKU09OVHlwZSgpLFxuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB0aGlzLmNvbmZpZygpXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH1cbn1cblxuLy8gbWVyZ2UgdG8gZGVmaW5lIE1hcGJveGdsTGF5ZXIncyBkZWZhdWx0IG9wdGlvbnMuXG5NYXBib3hnbExheWVyLm1lcmdlT3B0aW9ucyhvcHRpb25zKTtcblxuLy8gcmVnaXN0ZXIgTWFwYm94Z2xMYXllcidzIEpTT04gdHlwZSBmb3IgSlNPTiBkZXNlcmlhbGl6YXRpb24uXG5NYXBib3hnbExheWVyLnJlZ2lzdGVySlNPTlR5cGUoJ01hcGJveGdsTGF5ZXInKTtcblxuTWFwYm94Z2xMYXllci5yZWdpc3RlclJlbmRlcmVyKCdkb20nLCBjbGFzcyB7XG5cbiAgICBjb25zdHJ1Y3RvcihsYXllcikge1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgfVxuXG4gICAgZ2V0TWFwKCkge1xuICAgICAgICBpZiAoIXRoaXMubGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVyLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlKCk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmxheWVyO1xuICAgICAgICBpZiAodGhpcy5nbG1hcCkge1xuICAgICAgICAgICAgdGhpcy5nbG1hcC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICBtYXB0YWxrcy5Eb21VdGlsLnJlbW92ZURvbU5vZGUodGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgdGhpcy5fY29udGFpbmVyO1xuICAgICAgICBkZWxldGUgdGhpcy5nbG1hcDtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0WkluZGV4KHopIHtcbiAgICAgICAgdGhpcy5fekluZGV4ID0gejtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLnpJbmRleCA9IHo7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0NhbnZhc1JlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUxheWVyQ29udGFpbmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmdsbWFwKSB7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IG1hcHRhbGtzLlV0aWwuZXh0ZW5kKHt9LCB0aGlzLmxheWVyLm9wdGlvbnNbJ2dsT3B0aW9ucyddLCB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyOiB0aGlzLl9jb250YWluZXIsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgbWFwYm94Z2wuTG5nTGF0KGNlbnRlci54LCBjZW50ZXIueSksXG4gICAgICAgICAgICAgICAgem9vbTogbWFwLmdldFpvb20oKSAtIDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nbG1hcCA9IG5ldyBtYXBib3hnbC5NYXAob3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLmdsbWFwLm9uKCdsb2FkJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubGF5ZXIuZmlyZSgnbGF5ZXJsb2FkJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEV2ZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICdfem9vbWVuZCBfbW92aW5nIF9tb3ZlZW5kIF9waXRjaCBfcm90YXRlJyA6IHRoaXMub25FdmVudCxcbiAgICAgICAgICAgICdfem9vbWluZycgOiB0aGlzLm9uWm9vbWluZyxcbiAgICAgICAgICAgICdyZXNpemUnIDogdGhpcy5vblJlc2l6ZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uUmVzaXplKCkge1xuICAgICAgICB0aGlzLl9yZXNpemUoKTtcbiAgICAgICAgdGhpcy5vbkV2ZW50KCk7XG4gICAgfVxuXG4gICAgb25FdmVudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2xtYXApIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2V0TWFwKCk7XG4gICAgICAgICAgICBjb25zdCBjZW50ZXIgPSBtYXAuZ2V0Q2VudGVyKCk7XG4gICAgICAgICAgICBjb25zdCBjYW1lcmFPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICdjZW50ZXInIDogbmV3IG1hcGJveGdsLkxuZ0xhdChjZW50ZXIueCwgY2VudGVyLnkpLFxuICAgICAgICAgICAgICAgICd6b29tJyAgIDogbWFwLmdldFpvb20oKSAtIDEsXG4gICAgICAgICAgICAgICAgJ2JlYXJpbmcnIDogbWFwLmdldEJlYXJpbmcoKSxcbiAgICAgICAgICAgICAgICAncGl0Y2gnIDogbWFwLmdldFBpdGNoKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmdsbWFwLmp1bXBUbyhjYW1lcmFPcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uWm9vbWluZyhwYXJhbSkge1xuICAgICAgICBpZiAodGhpcy5nbG1hcCkge1xuICAgICAgICAgICAgY29uc3QgbWFwID0gdGhpcy5nZXRNYXAoKTtcbiAgICAgICAgICAgIHZhciBvcmlnaW4gPSBwYXJhbVsnb3JpZ2luJ107XG4gICAgICAgICAgICBvcmlnaW4gPSBtYXAuY29udGFpbmVyUG9pbnRUb0Nvb3JkaW5hdGUob3JpZ2luKTtcbiAgICAgICAgICAgIG9yaWdpbiA9IG5ldyBtYXBib3hnbC5MbmdMYXQob3JpZ2luLngsIG9yaWdpbi55KTtcbiAgICAgICAgICAgIGNvbnN0IGNhbWVyYU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgJ2Fyb3VuZCcgOiBvcmlnaW4sXG4gICAgICAgICAgICAgICAgJ2R1cmF0aW9uJyA6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmdsbWFwLnpvb21UbyhtYXAuZ2V0Wm9vbSgpIC0gMSwgY2FtZXJhT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlTGF5ZXJDb250YWluZXIoKSB7XG4gICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXIgPSBtYXB0YWxrcy5Eb21VdGlsLmNyZWF0ZUVsKCdkaXYnLCAnbWFwdGFsa3MtbWFwYm94Z2xsYXllcicpO1xuICAgICAgICBjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTsnO1xuICAgICAgICB0aGlzLl9yZXNpemUoKTtcbiAgICAgICAgaWYgKHRoaXMuX3pJbmRleCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnN0eWxlLnpJbmRleCA9IHRoaXMuX3pJbmRleDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5sYXllci5vcHRpb25zWydjb250YWluZXInXSA9PT0gJ2Zyb250JyA/IHRoaXMuZ2V0TWFwKCkuX3BhbmVsc1snZnJvbnRTdGF0aWMnXSA6IHRoaXMuZ2V0TWFwKCkuX3BhbmVsc1snYmFja1N0YXRpYyddO1xuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICB9XG5cbiAgICBfcmVzaXplKCkge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXI7XG4gICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuZ2V0TWFwKCkuZ2V0U2l6ZSgpO1xuICAgICAgICBjb250YWluZXIuc3R5bGUud2lkdGggPSBzaXplWyd3aWR0aCddICsgJ3B4JztcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IHNpemVbJ2hlaWdodCddICsgJ3B4JztcbiAgICB9XG5cbiAgICBfc2hvdygpIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB9XG5cbiAgICBfaGlkZSgpIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxufSk7XG4iXSwibmFtZXMiOlsib3B0aW9ucyIsIk1hcGJveGdsTGF5ZXIiLCJmcm9tSlNPTiIsImpzb24iLCJsYXllciIsImdldEdsTWFwIiwicmVuZGVyZXIiLCJfZ2V0UmVuZGVyZXIiLCJnbG1hcCIsInRvSlNPTiIsImdldEpTT05UeXBlIiwiZ2V0SWQiLCJjb25maWciLCJtYXB0YWxrcyIsIm1lcmdlT3B0aW9ucyIsInJlZ2lzdGVySlNPTlR5cGUiLCJyZWdpc3RlclJlbmRlcmVyIiwiZ2V0TWFwIiwic2hvdyIsIl9jb250YWluZXIiLCJyZW5kZXIiLCJfc2hvdyIsImhpZGUiLCJfaGlkZSIsImNsZWFyIiwicmVtb3ZlIiwicmVtb3ZlRG9tTm9kZSIsImlubmVySFRNTCIsInNldFpJbmRleCIsInoiLCJfekluZGV4Iiwic3R5bGUiLCJ6SW5kZXgiLCJpc0NhbnZhc1JlbmRlciIsIl9jcmVhdGVMYXllckNvbnRhaW5lciIsIm1hcCIsImNlbnRlciIsImdldENlbnRlciIsImV4dGVuZCIsIm1hcGJveGdsIiwiTG5nTGF0IiwieCIsInkiLCJnZXRab29tIiwiTWFwIiwib24iLCJmaXJlIiwiZ2V0RXZlbnRzIiwib25FdmVudCIsIm9uWm9vbWluZyIsIm9uUmVzaXplIiwiX3Jlc2l6ZSIsImNhbWVyYU9wdGlvbnMiLCJnZXRCZWFyaW5nIiwiZ2V0UGl0Y2giLCJqdW1wVG8iLCJwYXJhbSIsIm9yaWdpbiIsImNvbnRhaW5lclBvaW50VG9Db29yZGluYXRlIiwiem9vbVRvIiwiY29udGFpbmVyIiwiY3JlYXRlRWwiLCJjc3NUZXh0IiwicGFyZW50IiwiX3BhbmVscyIsImFwcGVuZENoaWxkIiwic2l6ZSIsImdldFNpemUiLCJ3aWR0aCIsImhlaWdodCIsImRpc3BsYXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLEFBQ0EsQUFFQSxJQUFNQSxVQUFVO2dCQUNDLEtBREQ7aUJBRUUsTUFGRjtpQkFHRTtpQkFDQTs7Q0FKbEI7O0FBUUEsSUFBYUMsYUFBYjs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBU1dDLFFBVFgscUJBU29CQyxJQVRwQixFQVMwQjtZQUNkLENBQUNBLElBQUQsSUFBU0Es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
