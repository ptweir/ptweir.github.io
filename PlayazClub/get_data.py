from mapbox import Distance
from mapbox import Geocoder

geocoder = Geocoder(access_token=<ENTERYOURTOKENHERE>)
distance_service = Distance(access_token=<ENTERYOURTOKENHERE>)

place_names = ['1529 Fillmore St, San Francisco, CA 94115',
'Sunnydale Ave, San Francisco, CA 94134',
'242 Lakeview Ave, San Francisco, CA 94112',
'Potrero Hill, San Francisco, CA',
'Cesar Chavez St, San Francisco, CA',
'Arizona',
'Chicago, IL',
'Philadelphia, PA',
'Atlanta, GA',
'Detroit, MI',
'New York, NY',
'Texas',
'Seattle, WA',
'Los Angeles, CA',
'Bakersfield, CA',
'San Diego, CA',
'Palo Alto, CA',
'Vallejo, CA',
'Richmond, CA',
'Sacramento, CA',
'Oakland, CA',
'3 Newcomb Ave, San Francisco, CA 94124']


quote_names = ["Fillmoe (Fillmore)",
"Sunnydale",
"Lakeview",
"P.H. (Potrero Hill)",
"Army Street (now Cesar Chavez)",
"Arizona",
"Chicago",
"Philly (Philadelphia)",
"Atlanta",
"Detroit",
"New York",
"Texas",
"Seattle",
"L.A.",
"Bakersfield",
"San Diego",
"P.A. (Palo Alto)",
"V-Town (Vallejo)",
"Richmond",
"Sacramento",
"Biggity Biggity O (Oakland)",
"H.P. (Hunters Point)"]

quotes = ["Where your Playaz Club at 4? My Playaz Club right in the heart of Fillmoe",
"Fillmoe, H.P. and Sunnydale, there's a playaz club everywhere you dwell",
"Lakeview, P.H. and Army Street, a different part of town, A different kind of freak",
"Lakeview, P.H. and Army Street, a different part of town, A different kind of freak",
"Lakeview, P.H. and Army Street, a different part of town, A different kind of freak",
"I'd rather kick it with the crew in Arizona, They chop game like we do in California",
"I know they got a Playaz Club out there in Chicago",
"What about that one they got out there in Philly, Fo?",
"You know they got one out there in Atlanta, the way they by choppin",
"Shit, Detroit, New York, Texas",
"Shit, Detroit, New York, Texas",
"Shit, Detroit, New York, Texas",
"Yeah, but we gonna move on down to these Playaz Clubs close to home like Seattle, L.A., Bakersfield, San Diego",
"Yeah, but we gonna move on down to these Playaz Clubs close to home like Seattle, L.A., Bakersfield, San Diego",
"Yeah, but we gonna move on down to these Playaz Clubs close to home like Seattle, L.A., Bakersfield, San Diego",
"Yeah, but we gonna move on down to these Playaz Clubs close to home like Seattle, L.A., Bakersfield, San Diego",
"P.A., V-Town, Richmond, Sacramento",
"P.A., V-Town, Richmond, Sacramento",
"P.A., V-Town, Richmond, Sacramento",
"P.A., V-Town, Richmond, Sacramento",
"Yeah, but a special shot goes out to the Playaz Club right across the water in the Biggity Biggity O",
"Uh, I feel you boy, where yours at Fly? Man, on the corner of Third and Newcomb right in the heart of H.P."]

city_features = []
for place_ind, place_name in enumerate(place_names):
    quote_name = quote_names[place_ind]
    quote = quotes[place_ind]
    print place_ind + 1, 'of', len(place_names), place_name

    response = geocoder.forward(place_name, country=['us'], limit=1)
        
    [lng, lat] = response.geojson()['features'][0]['center']
    name = response.geojson()['features'][0]['place_name']
    if response.geojson()['features'][0].has_key('bbox'):
        bbox = response.geojson()['features'][0]['bbox']
    else:
        print 'no bounding box'
        bbox = [lng-.001, lat-.001, lng+.001, lat+.001]
        
    city_feature = {'type': 'Feature', 'properties': {'quote': quote, 'bbox':bbox, 'quote_name':quote_name}, 'geometry': {'type': 'Point', 'coordinates': [lng, lat]}}
    city_features.append(city_feature)

response = distance_service.distances(city_features, 'driving')

durations = response.json()['durations']

out_file = open('durations.tsp', 'w')
out_file.write('NAME: playersClub\nTYPE: TSP\nCOMMENT: drivingDurations\nDIMENSION: '+str(len(durations))+'\n')
out_file.write('EDGE_WEIGHT_TYPE: EXPLICIT\nEDGE_WEIGHT_FORMAT: FULL_MATRIX\nEDGE_WEIGHT_SECTION\n')
for durs in durations:
    for d in durs:
        out_file.write(str(int(round(d))) + ' ')
    out_file.write('\n')

out_file.close()


