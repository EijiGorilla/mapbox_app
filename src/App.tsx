import React, { Component, useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  Marker,
  Popup,
  ZoomControl,
  Polygon,
  LayersControl,
} from 'react-leaflet';
import Layers from './Layers';
import Chart from './components/Chart';
import Select from 'react-select';
import './index.css';
import './App.css';

// Read https://react-leaflet.js.org/docs/api-map/
function App() {
  // Dropdown filter
  const [initStations, setInitStations] = useState<null | undefined | any>();
  const [stationSelected, setStationSelected] = useState<null | any>(null);

  const data_usa =
    'https://raw.githubusercontent.com/EijiGorilla/EijiGorilla.github.io/master/WebApp/ArcGIS_API_for_JavaScript/Sample/geojson_sample.geojson';
  const [geojsonData, setGeojsonData] = useState([]);
  const [chartData, setChartData] = useState<any>();

  // Function to Add 'All' to dropdown list
  function addDropdown(arr: any, elem: any) {
    if (arr.indexOf(elem) !== -1) {
      return arr;
    }
    arr.push(elem);
    return arr;
  }

  // Read geojson
  useEffect(() => {
    fetch(data_usa)
      .then((response: any) => {
        return response.json();
      })
      .then((data: any) => {
        setGeojsonData(data.features);

        // Create an object array of dropdown values
        const dropdownArray = data.features.map((property: any, index: any) => {
          return Object.assign({
            field1: property.properties.name,
          });
        });
        const final = addDropdown(dropdownArray, { field1: 'All' });
        setInitStations(final);

        // Create an object array of chart values
        const chartArray = data.features.map((property: any, index: any) => {
          return Object.assign({
            category: property.properties.name,
            value: property.properties.density,
          });
        });
        setChartData(chartArray);
      });
  }, []);

  const handleMunicipalityChange = (obj: any) => {
    setStationSelected(obj);
  };

  // Style CSS
  const customstyles = {
    option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
      // const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: isFocused ? '#999999' : isSelected ? '#2b2b2b' : '#2b2b2b',
        color: '#ffffff',
      };
    },

    control: (defaultStyles: any) => ({
      ...defaultStyles,
      backgroundColor: '#2b2b2b',
      borderColor: '#949494',
      height: 35,
      width: '170px',
      color: '#ffffff',
    }),
    singleValue: (defaultStyles: any) => ({ ...defaultStyles, color: '#fff' }),
  };

  return (
    <>
      {/* Dropdown filter */}
      <div className="dropdownFilterLayout">
        <b style={{ color: 'white', margin: 10, fontSize: '0.9vw' }}>Station</b>
        <Select
          placeholder="Select Station"
          value={stationSelected}
          options={initStations}
          onChange={handleMunicipalityChange}
          getOptionLabel={(x: any) => x.field1}
          styles={customstyles}
        />
      </div>
      <Chart data={chartData && chartData} />
      <MapContainer
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: -1,
          top: 0,
        }}
        center={[44.0011, -92.92177]}
        zoom={5}
      >
        <Layers data={geojsonData} state={stationSelected && stationSelected.field1} />
      </MapContainer>
    </>
  );
}

export default App;
