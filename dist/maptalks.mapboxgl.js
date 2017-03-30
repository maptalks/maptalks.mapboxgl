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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwdGFsa3MubWFwYm94Z2wuanMiLCJzb3VyY2VzIjpbIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1hcHRhbGtzIGZyb20gJ21hcHRhbGtzJztcbmltcG9ydCBtYXBib3hnbCBmcm9tICdtYXBib3hnbCc7XG5cbmNvbnN0IG9wdGlvbnMgPSB7XG4gICAgJ3JlbmRlcmVyJyA6ICdkb20nLFxuICAgICdjb250YWluZXInIDogJ2JhY2snLFxuICAgICdnbE9wdGlvbnMnIDoge1xuICAgICAgICAnc3R5bGUnIDogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvc3RyZWV0cy12OSdcbiAgICB9XG59O1xuXG5leHBvcnQgY2xhc3MgTWFwYm94Z2xMYXllciBleHRlbmRzIG1hcHRhbGtzLkxheWVyIHtcbiAgICAvKipcbiAgICAgKiBSZXByb2R1Y2UgYSBNYXBib3hnbExheWVyIGZyb20gbGF5ZXIncyBwcm9maWxlIEpTT04uXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBqc29uIC0gbGF5ZXIncyBwcm9maWxlIEpTT05cbiAgICAgKiBAcmV0dXJuIHtNYXBib3hnbExheWVyfVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHN0YXRpYyBmcm9tSlNPTihqc29uKSB7XG4gICAgICAgIGlmICghanNvbiB8fCBqc29uWyd0eXBlJ10gIT09ICdNYXBib3hnbExheWVyJykgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgICBjb25zdCBsYXllciA9IG5ldyBNYXBib3hnbExheWVyKGpzb25bJ2lkJ10sIGpzb25bJ29wdGlvbnMnXSk7XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICBnZXRHbE1hcCgpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSB0aGlzLl9nZXRSZW5kZXJlcigpO1xuICAgICAgICBpZiAocmVuZGVyZXIpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlci5nbG1hcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgdGhlIE1hcGJveGdsTGF5ZXIncyBKU09OLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gbGF5ZXIncyBKU09OXG4gICAgICovXG4gICAgdG9KU09OKCkge1xuICAgICAgICB2YXIganNvbiA9IHtcbiAgICAgICAgICAgICd0eXBlJzogdGhpcy5nZXRKU09OVHlwZSgpLFxuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB0aGlzLmNvbmZpZygpXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH1cbn1cblxuLy8gbWVyZ2UgdG8gZGVmaW5lIE1hcGJveGdsTGF5ZXIncyBkZWZhdWx0IG9wdGlvbnMuXG5NYXBib3hnbExheWVyLm1lcmdlT3B0aW9ucyhvcHRpb25zKTtcblxuLy8gcmVnaXN0ZXIgTWFwYm94Z2xMYXllcidzIEpTT04gdHlwZSBmb3IgSlNPTiBkZXNlcmlhbGl6YXRpb24uXG5NYXBib3hnbExheWVyLnJlZ2lzdGVySlNPTlR5cGUoJ01hcGJveGdsTGF5ZXInKTtcblxuTWFwYm94Z2xMYXllci5yZWdpc3RlclJlbmRlcmVyKCdkb20nLCBjbGFzcyB7XG5cbiAgICBjb25zdHJ1Y3RvcihsYXllcikge1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgfVxuXG4gICAgZ2V0TWFwKCkge1xuICAgICAgICBpZiAoIXRoaXMubGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVyLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlKCk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmxheWVyO1xuICAgICAgICBpZiAodGhpcy5nbG1hcCkge1xuICAgICAgICAgICAgdGhpcy5nbG1hcC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICBtYXB0YWxrcy5Eb21VdGlsLnJlbW92ZURvbU5vZGUodGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgdGhpcy5fY29udGFpbmVyO1xuICAgICAgICBkZWxldGUgdGhpcy5nbG1hcDtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0WkluZGV4KHopIHtcbiAgICAgICAgdGhpcy5fekluZGV4ID0gejtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLnpJbmRleCA9IHo7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0NhbnZhc1JlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUxheWVyQ29udGFpbmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmdsbWFwKSB7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IG1hcHRhbGtzLlV0aWwuZXh0ZW5kKHt9LCB0aGlzLmxheWVyLm9wdGlvbnNbJ2dsT3B0aW9ucyddLCB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyOiB0aGlzLl9jb250YWluZXIsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgbWFwYm94Z2wuTG5nTGF0KGNlbnRlci54LCBjZW50ZXIueSksXG4gICAgICAgICAgICAgICAgem9vbTogbWFwLmdldFpvb20oKSAtIDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nbG1hcCA9IG5ldyBtYXBib3hnbC5NYXAob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRFdmVudHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnX3pvb21lbmQgX21vdmluZyBfbW92ZWVuZCBfcGl0Y2ggX3JvdGF0ZScgOiB0aGlzLm9uRXZlbnQsXG4gICAgICAgICAgICAnX3pvb21pbmcnIDogdGhpcy5vblpvb21pbmcsXG4gICAgICAgICAgICAncmVzaXplJyA6IHRoaXMub25SZXNpemVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplKCk7XG4gICAgICAgIHRoaXMub25FdmVudCgpO1xuICAgIH1cblxuICAgIG9uRXZlbnQoKSB7XG4gICAgICAgIGlmICh0aGlzLmdsbWFwKSB7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgY29uc3QgY2FtZXJhT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAnY2VudGVyJyA6IG5ldyBtYXBib3hnbC5MbmdMYXQoY2VudGVyLngsIGNlbnRlci55KSxcbiAgICAgICAgICAgICAgICAnem9vbScgICA6IG1hcC5nZXRab29tKCkgLSAxLFxuICAgICAgICAgICAgICAgICdiZWFyaW5nJyA6IG1hcC5nZXRCZWFyaW5nKCksXG4gICAgICAgICAgICAgICAgJ3BpdGNoJyA6IG1hcC5nZXRQaXRjaCgpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5nbG1hcC5qdW1wVG8oY2FtZXJhT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblpvb21pbmcocGFyYW0pIHtcbiAgICAgICAgaWYgKHRoaXMuZ2xtYXApIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2V0TWFwKCk7XG4gICAgICAgICAgICB2YXIgb3JpZ2luID0gcGFyYW1bJ29yaWdpbiddO1xuICAgICAgICAgICAgb3JpZ2luID0gbWFwLmNvbnRhaW5lclBvaW50VG9Db29yZGluYXRlKG9yaWdpbik7XG4gICAgICAgICAgICBvcmlnaW4gPSBuZXcgbWFwYm94Z2wuTG5nTGF0KG9yaWdpbi54LCBvcmlnaW4ueSk7XG4gICAgICAgICAgICBjb25zdCBjYW1lcmFPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICdhcm91bmQnIDogb3JpZ2luLFxuICAgICAgICAgICAgICAgICdkdXJhdGlvbicgOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5nbG1hcC56b29tVG8obWFwLmdldFpvb20oKSAtIDEsIGNhbWVyYU9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUxheWVyQ29udGFpbmVyKCkge1xuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyID0gbWFwdGFsa3MuRG9tVXRpbC5jcmVhdGVFbCgnZGl2JywgJ21hcHRhbGtzLW1hcGJveGdsbGF5ZXInKTtcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7JztcbiAgICAgICAgdGhpcy5fcmVzaXplKCk7XG4gICAgICAgIGlmICh0aGlzLl96SW5kZXgpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zdHlsZS56SW5kZXggPSB0aGlzLl96SW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMubGF5ZXIub3B0aW9uc1snY29udGFpbmVyJ10gPT09ICdmcm9udCcgPyB0aGlzLmdldE1hcCgpLl9wYW5lbHNbJ2Zyb250U3RhdGljJ10gOiB0aGlzLmdldE1hcCgpLl9wYW5lbHNbJ2JhY2tTdGF0aWMnXTtcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgX3Jlc2l6ZSgpIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmdldE1hcCgpLmdldFNpemUoKTtcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLndpZHRoID0gc2l6ZVsnd2lkdGgnXSArICdweCc7XG4gICAgICAgIGNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBzaXplWydoZWlnaHQnXSArICdweCc7XG4gICAgfVxuXG4gICAgX3Nob3coKSB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgfVxuXG4gICAgX2hpZGUoKSB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbn0pO1xuIl0sIm5hbWVzIjpbIm9wdGlvbnMiLCJNYXBib3hnbExheWVyIiwiZnJvbUpTT04iLCJqc29uIiwibGF5ZXIiLCJnZXRHbE1hcCIsInJlbmRlcmVyIiwiX2dldFJlbmRlcmVyIiwiZ2xtYXAiLCJ0b0pTT04iLCJnZXRKU09OVHlwZSIsImdldElkIiwiY29uZmlnIiwibWFwdGFsa3MiLCJtZXJnZU9wdGlvbnMiLCJyZWdpc3RlckpTT05UeXBlIiwicmVnaXN0ZXJSZW5kZXJlciIsImdldE1hcCIsInNob3ciLCJfY29udGFpbmVyIiwicmVuZGVyIiwiX3Nob3ciLCJoaWRlIiwiX2hpZGUiLCJjbGVhciIsInJlbW92ZSIsInJlbW92ZURvbU5vZGUiLCJpbm5lckhUTUwiLCJzZXRaSW5kZXgiLCJ6IiwiX3pJbmRleCIsInN0eWxlIiwiekluZGV4IiwiaXNDYW52YXNSZW5kZXIiLCJfY3JlYXRlTGF5ZXJDb250YWluZXIiLCJtYXAiLCJjZW50ZXIiLCJnZXRDZW50ZXIiLCJleHRlbmQiLCJtYXBib3hnbCIsIkxuZ0xhdCIsIngiLCJ5IiwiZ2V0Wm9vbSIsIk1hcCIsImdldEV2ZW50cyIsIm9uRXZlbnQiLCJvblpvb21pbmciLCJvblJlc2l6ZSIsIl9yZXNpemUiLCJjYW1lcmFPcHRpb25zIiwiZ2V0QmVhcmluZyIsImdldFBpdGNoIiwianVtcFRvIiwicGFyYW0iLCJvcmlnaW4iLCJjb250YWluZXJQb2ludFRvQ29vcmRpbmF0ZSIsInpvb21UbyIsImNvbnRhaW5lciIsImNyZWF0ZUVsIiwiY3NzVGV4dCIsInBhcmVudCIsIl9wYW5lbHMiLCJhcHBlbmRDaGlsZCIsInNpemUiLCJnZXRTaXplIiwid2lkdGgiLCJoZWlnaHQiLCJkaXNwbGF5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxBQUNBLEFBRUEsSUFBTUEsVUFBVTtnQkFDQyxLQUREO2lCQUVFLE1BRkY7aUJBR0U7aUJBQ0E7O0NBSmxCOztBQVFBLElBQWFDLGFBQWI7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQVNXQyxRQVRYLHFCQVNvQkMsSUFUcEIsRUFTMEI7WUFDZCxDQUFDQSxJQUFELElBQVNBLEtBQUssTUFBTCxNQUFpQixlQUE5QixFQUErQzttQkFBUyxJQUFQOztZQUMzQ0MsUUFBUSxJQUFJSCxhQUFKLENBQWtCRSxLQUFLLElBQUwsQ0FBbEIsRUFBOEJBLEtBQUssU0FBTCxDQUE5QixDQUFkO2VBQ09D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
