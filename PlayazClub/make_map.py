#before running this script:
#copy 'durations.tsp' to concorde/TSP directory,
#then run './concorde -o out_durations.sol durations.tsp',
#then copy 'out_durations.sol' to this directory.

in_file = open('out_durations.sol', 'r')
raw_in = in_file.readlines()
ind_order = []
for line in raw_in[1:]:
    for ind in line.split():
        ind_order.append(int(ind))
        
in_file.close()

for city_ind in range(len(city_features)):
    zoom =  max(15./(1 + city_features[city_ind]['properties']['bbox'][2] - city_features[city_ind]['properties']['bbox'][0]), 7)
    city_features[city_ind]['properties']['zoom'] = zoom

for _i, ind in enumerate(ind_order): 
    if ind > 0:
        duration_this_leg = durations[ind_order[_i-1]][ind]
        total_duration += duration_this_leg
    else:
        duration_this_leg = 0
        total_duration = 0
    if duration_this_leg > 60*60:
        dur_str = str(round(duration_this_leg/(60.*60.),1))+' hr'
    else:
        dur_str = str(round(duration_this_leg/(60.), 1))+' min'

    print '<tr><td>'+city_features[ind]['properties']['quote_name']+'</td><td>'+dur_str+'</td></tr>'

print '<tr><td>Total:</td><td>'+str(round(total_duration/(60.*60.),1))+' hr'+'</td></tr>'
######################save map:
locations_string = ''
for ind in ind_order:
    city_feature = city_features[ind]
    locations_string = locations_string + """
    {
        "id": " """ + str(ind) +""" ",
        "title": " """ + city_feature['properties']['quote_name'] + """ ",
        "description": \"""" + city_feature['properties']['quote'].encode('utf-8') + """\",
        "camera": {
            center: [""" + str(city_feature['geometry']['coordinates'][0]) + ', ' + str(city_feature['geometry']['coordinates'][1]) + """],
            zoom: """ + str(city_feature['properties']['zoom']) + """,
            pitch: 50,
            speed: 0.5
        }
    },"""

locations_string = """
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title></title>
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.31.0/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.31.0/mapbox-gl.css' rel='stylesheet' />
    <style>
        body { margin:0; padding:0; }
        #map { position:absolute; top:0; bottom:0; width:100%; }
    </style>
</head>
<body>

<style>
.map-overlay-container {
    position: absolute;
    width: 25%;
    top: 0;
    left: 0;
    padding: 10px;
    z-index: 1;
}

.map-overlay {
    font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
    background-color: #fff;
    border-radius: 3px;
    padding: 10px;
    box-shadow:0 1px 2px rgba(0,0,0,0.20);
}

.map-overlay h2,
.map-overlay p {
    margin: 0 0 10px;
}
</style>

<div id='map'></div>

<div class='map-overlay-container'>
  <div class='map-overlay'>
    <h2 id='location-title'></h2>
    <p>&#9835; &#34;<span id='location-description'></span>&#34; &#9835;</p>
    <small>Text credit: <a target='_blank' href='https://play.google.com/music/preview/Tr5rb4wvhquxz2fa2be56wntsm4?lyrics=1&utm_source=google&utm_medium=search&utm_campaign=lyrics&pcampaignid=kp-lyrics'>Google Play</a></small>
  </div>
</div>

<script>
mapboxgl.accessToken = 'pk.eyJ1IjoicHR3IiwiYSI6ImNpeHNodXh6dzAwMGMyd29jc3o0N3l2am4ifQ.IUyNISmPOGZJNdxuiyKrmA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-100, 40],
    maxZoom: 15,
    minZoom: 3,
    zoom: 4
});

var title = document.getElementById('location-title');
var description = document.getElementById('location-description');

var locations = [""" + locations_string + """];


function playback(index) {
    title.textContent = locations[index].title;
    description.textContent = locations[index].description;

    // Animate the map position based on camera properties
    map.flyTo(locations[index].camera);

    map.once('moveend', function() {
        // Duration the slide is on screen after interaction
        window.setTimeout(function() {
            // Increment index
            index = (index + 1 === locations.length) ? 0 : index + 1;
            playback(index);
        }, 3000); // After callback, show the location for 3 seconds.
    });
}

// Display the last title/description first
title.textContent = locations[locations.length - 1].title;
description.textContent = locations[locations.length - 1].description;

map.on('load', function() {

    // Start the playback animation for each borough
    playback(0);
});
</script>

</body>
</html>

"""
out_file = open('map.html', 'w')
out_file.write(locations_string)
out_file.close()

