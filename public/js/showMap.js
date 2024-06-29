mapboxgl.accessToken = mapToken;
const coordinates = campground.geometry.coordinates;

if (coordinates.length) {
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/outdoors-v12',// streets-v12, standard // style URL
        center: coordinates, // starting position [lng, lat]
        zoom: 9, // starting zoom
    });

    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(
                `<h4>${campground.title}</h4>
                <p>${campground.location}</p>`
            ))
        .addTo(map);
}
else {
    document.querySelector('#map').style.display = 'none';
}