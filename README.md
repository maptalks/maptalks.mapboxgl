# maptalks.mapboxgl

[![NPM Version](https://img.shields.io/npm/v/maptalks.mapboxgl.svg)](https://github.com/maptalks/maptalks.mapboxgl)

A plugin to add [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) as a layer for maptalks.js.

![screenshot](https://cloud.githubusercontent.com/assets/13678919/25611501/ec90d0a4-2f59-11e7-91b5-1ed6c7b9352d.jpg)

## Examples

* [mapbox-gl-js demo with light style](https://maptalks.github.io/maptalks.mapboxgl/demo/).

## Install
  
* Install with npm: ```npm install maptalks.mapboxgl```. 
* Download from [dist directory](https://github.com/maptalks/maptalks.mapboxgl/tree/gh-pages/dist).
* Use unpkg CDN: ```https://unpkg.com/maptalks.mapboxgl/dist/maptalks.mapboxgl.min.js```

## Usage

As a plugin, ```maptalks.mapboxgl``` must be loaded after ```maptalks.js``` in browsers.
```html
<script type="text/javascript" src="https://unpkg.com/maptalks/dist/maptalks.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/maptalks.mapboxgl/dist/maptalks.mapboxgl.min.js"></script>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.36.0/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.36.0/mapbox-gl.css' rel='stylesheet' />
<script>
var mapboxglLayer = new maptalks.MapboxglLayer('tile',{
        glOptions : {
            'style' : 'mapbox://styles/mapbox/light-v9'
        }
    }).addTo(map);
</script>
```

## Supported Browsers

IE 11, Chrome, Firefox, other modern and mobile browsers support WebGL.

## API Reference

```MapboxglLayer``` is a subclass of [maptalks.Layer](http://docs.maptalks.org/api/maptalks.Layer.html) and inherits all the methods of its parent.

### `Constructor`

```javascript
new maptalks.MapboxglLayer(id, data, options)
```

* id **String** layer id
* data **Marker[]** layer data, an array of maptalks.Marker
* options **Object** options
    * glOptions **Object** mapboxgl creation options defined in [mapbox-gl-js api doc](https://www.mapbox.com/mapbox-gl-js/api/#map)
    * other options defined in [maptalks.Layer](http://docs.maptalks.org/api/maptalks.Layer.html)

### `getGlMap`

get mapbox-gl-js map instance used by the layer

**Returns** `Map`

### `toJSON()`

export the layer's JSON.

```javascript
var json = mapboxglLayer.toJSON();
```

**Returns** `Object`

## Contributing

We welcome any kind of contributions including issue reportings, pull requests, documentation corrections, feature requests and any other helps.

## Develop

The only source file is ```index.js```.

It is written in ES6, transpiled by [babel](https://babeljs.io/) and tested with [mocha](https://mochajs.org) and [expect.js](https://github.com/Automattic/expect.js).

### Scripts

* Install dependencies
```shell
$ npm install
```

* Watch source changes and generate runnable bundle repeatedly
```shell
$ gulp watch
```

* Tests
```shell
$ npm test
```

* Watch source changes and run tests repeatedly
```shell
$ gulp tdd
```

* Package and generate minified bundles to dist directory
```shell
$ gulp minify
```

* Lint
```shell
$ npm run lint
```
