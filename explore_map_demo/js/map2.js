// $(document).ready(function() {
$("#map__container").css("width", "100%");
$("#map__container").css("height", "100%");
$("#map__container").css("position", "absolute");
$("#map__container").css("top", "0px");
$("#map__container").css("left", "0px");

var southWest = L.latLng(-89.98155760646617, -180),
northEast = L.latLng(89.99346179538875, 180);
var bounds = L.latLngBounds(southWest, northEast);
var Stadia_StamenWatercolor = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
	maxZoom: 16,
	minZoom: 3,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

// map.setMaxBounds(bounds);
var map = new L.Map("map__container", {
	center: [41.90, 12.49],
	zoom: 3,
	maxZoom: 16,
	minZoom: 3,
	maxBounds: bounds,
	maxBoundsViscosity: 0.0

}).addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
map.on('drag', function() {
		map.panInsideBounds(bounds, { animate: false });
});

var bookIcon = L.Icon.extend({
	options:{iconUrl: 'images/icons8-libro-50.png',
		// shadowUrl: 'leaf-shadow.png',
	
		iconSize:	[40, 40], // size of the icon
		// shadowSize:	 [50, 64], // size of the shadow
		// iconAnchor:	 [22, 94], // point of the icon which will correspond to marker's location
		// shadowAnchor: [4, 62],	// the same for the shadow
		popupAnchor:	[0, -20] // point from which the popup should open relative to the iconAnchor
	}
});

var bookIcon = new bookIcon()

var markers = L.markerClusterGroup({
	iconCreateFunction: function(cluster) {
		return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>', className: 'customMarkerGroup', iconSize: L.point(50, 50)});
	}
});

map.addLayer(markers);


function getRandom(min, max) {
	return Math.random() * (max - min) + min;
}