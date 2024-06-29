// no worries, public token from their website
mapboxgl.accessToken = 'pk.eyJ1IjoiaGVsLWdlZSIsImEiOiJjbHh2ZW1mZjMwNzJpMnJzYWJoeTJ3ZzB3In0.IJkBcQHk1q4EIPTYyUOcUg';

const toggleButton = document.querySelector('#toggleModeBtn');

let mode = 'light';

toggleButton.addEventListener('click', toggleMode);

let map;
initializeMap(mode);

// Function to toggle mode and reinitialize map
function toggleMode() {
    mode = mode === 'dark' ? 'light' : 'dark';
    initializeMap(mode);

    if (mode === 'dark') {
        toggleButton.textContent = '🌙';
        toggleButton.classList.remove('btn-dark-outline');
        toggleButton.classList.add('btn-light-outline');
    } else {
        toggleButton.textContent = '☀️';
        toggleButton.classList.remove('btn-light-outline');
        toggleButton.classList.add('btn-dark-outline');
    }
}

function initializeMap(mode) {
    if (map) {
        map.remove();
    }

    map = new mapboxgl.Map({
        container: 'clusterMap',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: `mapbox://styles/mapbox/${mode}-v11`,
        center: [-103.5917, 40.6699],
        zoom: 3
    });

    const geojson = {
        type: 'FeatureCollection',
        features: campgrounds.map(c => (c.geojson))
    };

    map.on('load', () => {
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        map.addSource('campgrounds', {
            type: 'geojson',
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
            data: geojson, //'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            paint: {
                // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',
                    10,
                    '#f1f075',
                    750,
                    '#f28cb1'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    10,
                    25,
                    100,
                    40
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'campgrounds',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

        // inspect a cluster on click
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('campgrounds').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();

            const id = e.features[0].properties.id;
            const title = e.features[0].properties.title;
            const location = e.features[0].properties.location;

            // Ensure that if the map is zoomed out such that
            // multiple copies of the feature are visible, the
            // popup appears over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    `<h4><a href="/campgrounds/${id}">${title}</a></h4>
                <p>${location}</p>`
                )
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}