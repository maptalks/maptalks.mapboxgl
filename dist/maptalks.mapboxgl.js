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
            '_zooming': this.onEvent,
            'resize': this.onResize
        };
    };

    _class.prototype.onResize = function onResize() {
        this._resize();
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
                'zoom': map.getZoom() - 1,
                'around': origin
            };
            this.glmap.jumpTo(cameraOptions);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwdGFsa3MubWFwYm94Z2wuanMiLCJzb3VyY2VzIjpbIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1hcHRhbGtzIGZyb20gJ21hcHRhbGtzJztcbmltcG9ydCBtYXBib3hnbCBmcm9tICdtYXBib3hnbCc7XG5cbmNvbnN0IG9wdGlvbnMgPSB7XG4gICAgJ3JlbmRlcmVyJyA6ICdkb20nLFxuICAgICdjb250YWluZXInIDogJ2JhY2snLFxuICAgICdnbE9wdGlvbnMnIDoge1xuICAgICAgICAnc3R5bGUnIDogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvc3RyZWV0cy12OSdcbiAgICB9XG59O1xuXG5leHBvcnQgY2xhc3MgTWFwYm94Z2xMYXllciBleHRlbmRzIG1hcHRhbGtzLkxheWVyIHtcbiAgICAvKipcbiAgICAgKiBSZXByb2R1Y2UgYSBNYXBib3hnbExheWVyIGZyb20gbGF5ZXIncyBwcm9maWxlIEpTT04uXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBqc29uIC0gbGF5ZXIncyBwcm9maWxlIEpTT05cbiAgICAgKiBAcmV0dXJuIHtNYXBib3hnbExheWVyfVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHN0YXRpYyBmcm9tSlNPTihqc29uKSB7XG4gICAgICAgIGlmICghanNvbiB8fCBqc29uWyd0eXBlJ10gIT09ICdNYXBib3hnbExheWVyJykgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgICBjb25zdCBsYXllciA9IG5ldyBNYXBib3hnbExheWVyKGpzb25bJ2lkJ10sIGpzb25bJ29wdGlvbnMnXSk7XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICBnZXRHbE1hcCgpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSB0aGlzLl9nZXRSZW5kZXJlcigpO1xuICAgICAgICBpZiAocmVuZGVyZXIpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlci5nbG1hcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgdGhlIE1hcGJveGdsTGF5ZXIncyBKU09OLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gbGF5ZXIncyBKU09OXG4gICAgICovXG4gICAgdG9KU09OKCkge1xuICAgICAgICB2YXIganNvbiA9IHtcbiAgICAgICAgICAgICd0eXBlJzogdGhpcy5nZXRKU09OVHlwZSgpLFxuICAgICAgICAgICAgJ2lkJzogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB0aGlzLmNvbmZpZygpXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH1cbn1cblxuLy8gbWVyZ2UgdG8gZGVmaW5lIE1hcGJveGdsTGF5ZXIncyBkZWZhdWx0IG9wdGlvbnMuXG5NYXBib3hnbExheWVyLm1lcmdlT3B0aW9ucyhvcHRpb25zKTtcblxuLy8gcmVnaXN0ZXIgTWFwYm94Z2xMYXllcidzIEpTT04gdHlwZSBmb3IgSlNPTiBkZXNlcmlhbGl6YXRpb24uXG5NYXBib3hnbExheWVyLnJlZ2lzdGVySlNPTlR5cGUoJ01hcGJveGdsTGF5ZXInKTtcblxuTWFwYm94Z2xMYXllci5yZWdpc3RlclJlbmRlcmVyKCdkb20nLCBjbGFzcyB7XG5cbiAgICBjb25zdHJ1Y3RvcihsYXllcikge1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgfVxuXG4gICAgZ2V0TWFwKCkge1xuICAgICAgICBpZiAoIXRoaXMubGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVyLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlKCk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmxheWVyO1xuICAgICAgICBpZiAodGhpcy5nbG1hcCkge1xuICAgICAgICAgICAgdGhpcy5nbG1hcC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICBtYXB0YWxrcy5Eb21VdGlsLnJlbW92ZURvbU5vZGUodGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgdGhpcy5fY29udGFpbmVyO1xuICAgICAgICBkZWxldGUgdGhpcy5nbG1hcDtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0WkluZGV4KHopIHtcbiAgICAgICAgdGhpcy5fekluZGV4ID0gejtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLnpJbmRleCA9IHo7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0NhbnZhc1JlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUxheWVyQ29udGFpbmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmdsbWFwKSB7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IG1hcHRhbGtzLlV0aWwuZXh0ZW5kKHt9LCB0aGlzLmxheWVyLm9wdGlvbnNbJ2dsT3B0aW9ucyddLCB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyOiB0aGlzLl9jb250YWluZXIsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgbWFwYm94Z2wuTG5nTGF0KGNlbnRlci54LCBjZW50ZXIueSksXG4gICAgICAgICAgICAgICAgem9vbTogbWFwLmdldFpvb20oKSAtIDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nbG1hcCA9IG5ldyBtYXBib3hnbC5NYXAob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRFdmVudHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnX3pvb21lbmQgX21vdmluZyBfbW92ZWVuZCBfcGl0Y2ggX3JvdGF0ZScgOiB0aGlzLm9uRXZlbnQsXG4gICAgICAgICAgICAnX3pvb21pbmcnIDogdGhpcy5vbkV2ZW50LFxuICAgICAgICAgICAgJ3Jlc2l6ZScgOiB0aGlzLm9uUmVzaXplXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25SZXNpemUoKSB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZSgpO1xuICAgIH1cblxuICAgIG9uRXZlbnQoKSB7XG4gICAgICAgIGlmICh0aGlzLmdsbWFwKSB7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgY29uc3QgY2FtZXJhT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAnY2VudGVyJyA6IG5ldyBtYXBib3hnbC5MbmdMYXQoY2VudGVyLngsIGNlbnRlci55KSxcbiAgICAgICAgICAgICAgICAnem9vbScgICA6IG1hcC5nZXRab29tKCkgLSAxLFxuICAgICAgICAgICAgICAgICdiZWFyaW5nJyA6IG1hcC5nZXRCZWFyaW5nKCksXG4gICAgICAgICAgICAgICAgJ3BpdGNoJyA6IG1hcC5nZXRQaXRjaCgpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5nbG1hcC5qdW1wVG8oY2FtZXJhT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblpvb21pbmcocGFyYW0pIHtcbiAgICAgICAgaWYgKHRoaXMuZ2xtYXApIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2V0TWFwKCk7XG4gICAgICAgICAgICB2YXIgb3JpZ2luID0gcGFyYW1bJ29yaWdpbiddO1xuICAgICAgICAgICAgb3JpZ2luID0gbWFwLmNvbnRhaW5lclBvaW50VG9Db29yZGluYXRlKG9yaWdpbik7XG4gICAgICAgICAgICBvcmlnaW4gPSBuZXcgbWFwYm94Z2wuTG5nTGF0KG9yaWdpbi54LCBvcmlnaW4ueSk7XG4gICAgICAgICAgICBjb25zdCBjYW1lcmFPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICd6b29tJyAgIDogbWFwLmdldFpvb20oKSAtIDEsXG4gICAgICAgICAgICAgICAgJ2Fyb3VuZCcgOiBvcmlnaW5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmdsbWFwLmp1bXBUbyhjYW1lcmFPcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVMYXllckNvbnRhaW5lcigpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lciA9IG1hcHRhbGtzLkRvbVV0aWwuY3JlYXRlRWwoJ2RpdicsICdtYXB0YWxrcy1tYXBib3hnbGxheWVyJyk7XG4gICAgICAgIGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlOyc7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZSgpO1xuICAgICAgICBpZiAodGhpcy5fekluZGV4KSB7XG4gICAgICAgICAgICBjb250YWluZXIuc3R5bGUuekluZGV4ID0gdGhpcy5fekluZGV4O1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmxheWVyLm9wdGlvbnNbJ2NvbnRhaW5lciddID09PSAnZnJvbnQnID8gdGhpcy5nZXRNYXAoKS5fcGFuZWxzWydmcm9udFN0YXRpYyddIDogdGhpcy5nZXRNYXAoKS5fcGFuZWxzWydiYWNrU3RhdGljJ107XG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIH1cblxuICAgIF9yZXNpemUoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lcjtcbiAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaXplID0gdGhpcy5nZXRNYXAoKS5nZXRTaXplKCk7XG4gICAgICAgIGNvbnRhaW5lci5zdHlsZS53aWR0aCA9IHNpemVbJ3dpZHRoJ10gKyAncHgnO1xuICAgICAgICBjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gc2l6ZVsnaGVpZ2h0J10gKyAncHgnO1xuICAgIH1cblxuICAgIF9zaG93KCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cblxuICAgIF9oaWRlKCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6WyJvcHRpb25zIiwiTWFwYm94Z2xMYXllciIsImZyb21KU09OIiwianNvbiIsImxheWVyIiwiZ2V0R2xNYXAiLCJyZW5kZXJlciIsIl9nZXRSZW5kZXJlciIsImdsbWFwIiwidG9KU09OIiwiZ2V0SlNPTlR5cGUiLCJnZXRJZCIsImNvbmZpZyIsIm1hcHRhbGtzIiwibWVyZ2VPcHRpb25zIiwicmVnaXN0ZXJKU09OVHlwZSIsInJlZ2lzdGVyUmVuZGVyZXIiLCJnZXRNYXAiLCJzaG93IiwiX2NvbnRhaW5lciIsInJlbmRlciIsIl9zaG93IiwiaGlkZSIsIl9oaWRlIiwiY2xlYXIiLCJyZW1vdmUiLCJyZW1vdmVEb21Ob2RlIiwiaW5uZXJIVE1MIiwic2V0WkluZGV4IiwieiIsIl96SW5kZXgiLCJzdHlsZSIsInpJbmRleCIsImlzQ2FudmFzUmVuZGVyIiwiX2NyZWF0ZUxheWVyQ29udGFpbmVyIiwibWFwIiwiY2VudGVyIiwiZ2V0Q2VudGVyIiwiZXh0ZW5kIiwibWFwYm94Z2wiLCJMbmdMYXQiLCJ4IiwieSIsImdldFpvb20iLCJNYXAiLCJnZXRFdmVudHMiLCJvbkV2ZW50Iiwib25SZXNpemUiLCJfcmVzaXplIiwiY2FtZXJhT3B0aW9ucyIsImdldEJlYXJpbmciLCJnZXRQaXRjaCIsImp1bXBUbyIsIm9uWm9vbWluZyIsInBhcmFtIiwib3JpZ2luIiwiY29udGFpbmVyUG9pbnRUb0Nvb3JkaW5hdGUiLCJjb250YWluZXIiLCJjcmVhdGVFbCIsImNzc1RleHQiLCJwYXJlbnQiLCJfcGFuZWxzIiwiYXBwZW5kQ2hpbGQiLCJzaXplIiwiZ2V0U2l6ZSIsIndpZHRoIiwiaGVpZ2h0IiwiZGlzcGxheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsQUFDQSxBQUVBLElBQU1BLFVBQVU7Z0JBQ0MsS0FERDtpQkFFRSxNQUZGO2lCQUdFO2lCQUNBOztDQUpsQjs7QUFRQSxJQUFhQyxhQUFiOzs7Ozs7Ozs7Ozs7Ozs7OztrQkFTV0MsUUFUWCxxQkFTb0JDLElBVHBCLEVBUzBCO1lBQ2QsQ0FBQ0EsSUFBRCxJQUFTQSxLQUFLLE1BQUwsTUFBaUIsZUFBOUIsRUFBK0M7bUJBQVMsSUFBUDs7WUFDM0NDLFFBQVEsSUFBSUgsYUFBSixDQUFrQkUsS0FBSyxJQUFMLENBQWxCLEVBQThCQSxLQUFLLFNBQUwsQ0FBOUIsQ0FBZDtlQUNPQyxLQUFQO0tBWlI7OzRCQWVJQyxRQWZKLHVCQWVlO1lBQ0RDLFdBQVcs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
