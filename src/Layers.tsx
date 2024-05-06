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
import L from 'leaflet';
import './App.css';

const Layers = (props: any) => {
  // const [usaData, setUsaData] = useState<any>(['Alabama', 'Ohio']);
  const [initialData, setInitialData] = useState<any>(props.data);
  const [usaData, setUsaData] = useState<any | null>([]);
  const [popupText, setPopupText] = useState<any>();
  const [popupClicked, setPopupClicked] = useState<boolean>(false);

  // Call useMap
  // const map = useMap();

  const map = useMapEvents({
    zoomend: () => {
      // console.log(map.getZoom());
    },
    moveend: () => {
      // console.log(map.getBounds());
    },
  });

  // Use the map methods
  // console.log('Map Bounds:', map.getBounds());
  // console.log('Zoom Level:', map.getZoom());
  // Popup
  var popup = L.popup({
    closeOnClick: false,
  });

  useEffect(() => {
    if (props.state && props.state !== 'All') {
      setUsaData(props.state);

      // Filter props.data based on selected props.state
      const filtered_data = props.data.filter((a: any) => a.properties.name === props.state);
      const border = L.geoJSON(filtered_data[0]);
      map.fitBounds(border.getBounds());

      // If i want to open popup, when a state is selected from the drop-down list
      // const popup_name = filtered_data[0].properties.name;
      // popup.setLatLng(border.getBounds().getCenter());
      // const state_name = `<b>${popup_name}</b>`;
      // popup.setContent(state_name);
      // popup.openOn(map);

      //  const zoomGeometry = filtered_data[0].geometry.coordinates[0];
      // map.flyToBounds(zoomGeometry);
    } else if (props.state === 'All') {
      const border_all = L.geoJSON(props.data);
      map.fitBounds(border_all.getBounds());
    }
  }, [props.state]);

  // Label
  function onEachFeature(feature: any, layer: any) {
    // does this feature have a property named popupContent?
    if (feature.properties) {
      layer.bindTooltip(feature.properties.name, {
        permanent: true,
        direction: 'center',
        className: 'my-labels',
      });
      layer.on('click', (event: any) => {
        const popup_name = feature.properties.name;
        const popup_density = feature.properties.density;
        const popup_contents = `<b style="color:blue">${popup_name}</b> </br>
                                    Populatin density: ${popup_density}
                                    `;
        layer.bindPopup(popup_contents);
      });
    }
  }

  // Polygon color
  function getColor(density: any) {
    return density > 1000
      ? '#8c2d04'
      : density > 900
        ? '#d94801'
        : density > 800
          ? '#f16913'
          : density > 700
            ? '#fd8d3c'
            : density > 600
              ? '#fdae6b'
              : density > 500
                ? '#fdd0a2'
                : density > 400
                  ? '#fee6ce'
                  : '#fff5eb';
  }

  function onStyle(feature: any) {
    var density = feature.properties.density;
    return {
      fillColor: getColor(density),
      fillOpacity: 0.7,
      weight: 1,
      opacity: 0.7,
      dashArray: 3,
      color: 'black',
    };
    // if (density < 1000) {
    //   return {
    //     fillColor: '#FFA500',
    //     fillOpacity: 0.5,
    //     weight: 1,
    //     opacity: 0.7,
    //     dashArray: 3,
    //     color: 'black',
    //   };
    // } else if (density >= 1000) {
    //   return {
    //     fillColor: '#0047AB',
    //     fillOpacity: 0.5,
    //     weight: 1,
    //     opacity: 0.7,
    //     dashArray: 3,
    //     color: 'black',
    //   };
    // }
  }

  // L.geoJSON(props.data, {
  //   onEachFeature: onEachFeature,
  // }).addTo(map);

  // Popup
  // useEffect(() => {
  //   if (props.data[0]) {
  //     const filtered_data = props.data.filter((a: any) => a.properties.name === popupText);
  //     const border = L.geoJSON(filtered_data[0]);
  //     const popup_name = filtered_data[0].properties.name;
  //     const popup_density = filtered_data[0].properties.density;
  //     popup.setLatLng(border.getBounds().getCenter());
  //     const popup_contents = `<b>${popup_name}</b> </br>
  //                             Populatin density: ${popup_density}
  //                             `;
  //     popup.setContent(popup_contents);
  //     popup.openOn(map);
  //   }
  // }, [popupText, popupClicked]);

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
      {/* Reference: https://docs.maptiler.com/leaflet/examples/choropleth-geojson/ */}
      <div id="state-legend" className="legend">
        <h4>Population Density of USA </h4>
        <div>
          <span style={{ backgroundColor: '#fff5eb' }}></span>
          {'>'} 1000
        </div>
        <div>
          <span style={{ backgroundColor: '#fee6ce' }}></span>900
        </div>
        <div>
          <span style={{ backgroundColor: '#fdd0a2' }}></span>800
        </div>
        <div>
          <span style={{ backgroundColor: '#fdae6b' }}></span>700
        </div>
        <div>
          <span style={{ backgroundColor: '#fd8d3c' }}></span>600
        </div>
        <div>
          <span style={{ backgroundColor: '#f16913' }}></span>500
        </div>
        <div>
          <span style={{ backgroundColor: '#d94801' }}></span>400
        </div>
        <div>
          <span style={{ backgroundColor: '#8c2d04' }}></span>300
        </div>
      </div>

      <GeoJSON
        key={JSON.stringify(props.data, usaData, props.state)}
        data={props.data}
        eventHandlers={{
          click: (event: any) => {
            const id = event.layer.feature.properties.name;
            // setPopupText(id);
            // setPopupClicked(popupClicked === false ? true : false); // this ensures popupClicked is changed when clicked
          },
        }}
        filter={props.state === null ? initialFilterGeo : filterGeo}
        style={props.data && onStyle}
        onEachFeature={onEachFeature}
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
