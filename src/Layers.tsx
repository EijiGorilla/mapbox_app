import React, { useState, useEffect, useRef } from 'react';
import {
  TileLayer,
  LayersControl,
  useMap,
  GeoJSON,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import { useLeafletContext } from '@react-leaflet/core';
// Refernce: https://javascript.plainenglish.io/react-leaflet-v3-creating-a-mapping-application-d5477f19bdeb

const Layers = (props: any) => {
  // const [usaData, setUsaData] = useState<any>(['Alabama', 'Ohio']);
  const [initialData, setInitialData] = useState<any>(props.data);
  const [usaData, setUsaData] = useState<any | null>([]);

  // Call useMap
  // const map = useMap();
  // const map = useMapEvents({
  //   zoomend: () => {
  //     // console.log(map.getZoom());
  //   },
  //   moveend: () => {
  //     // console.log(map.getBounds());
  //   },
  // });

  // Use the map methods
  // console.log('Map Bounds:', map.getBounds());
  // console.log('Zoom Level:', map.getZoom());

  useEffect(() => {
    if (props.state !== null) {
      setUsaData(props.state);
    }
  }, [props.state]);

  // filter geoJson layer
  // make sure to use props.state instead of useState
  // otherwise, it will not be updated properly.
  const filterGeo = (feature: any) => {
    if (props.state === 'All') {
      return props.data;
    } else {
      return props.state.includes(feature.properties.name);
    }
  };

  // Initial state is display all states
  const initialFilterGeo = () => {
    return props.data;
  };

  const setColor = (properties: any) => {
    return { weight: 1 };
  };
  return (
    <>
      {/* <button style={{ width: '100px', height: '20px' }} onClick={() => setUsaData(initialData)}>
        Reset
      </button> */}
      <GeoJSON
        key={JSON.stringify(props.data, usaData, props.state)}
        data={props.data}
        // eventHandlers={{
        //   click: (event: any) => {
        //     //console.log(event.layer.feature.properties.name);
        //     setUsaData(event.layer.feature.properties.name);
        //   },
        // }}
        filter={props.state === null ? initialFilterGeo : filterGeo}
        style={setColor}
      />
      <Marker position={[44.0011, -92.92177]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Basic Map">
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Topo Map">
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
    </>
  );
};

export default Layers;
