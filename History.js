import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Dropdown } from 'react-native-element-dropdown';

export default function History() {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedHours, setSelectedHours] = useState(1);  // Default to 1 hour

  const timeOptions = [
    { label: 'View Map of past 30 min', value: 0.5 },
    { label: 'View Map of past 1 hour', value: 1 },
    { label: 'View Map of past 12 hours', value: 12 },
    { label: 'View Map of past 24 hours', value: 24 }
  ];

  useEffect(() => {
    fetchCoordinates();
  }, [selectedHours]);

  const fetchCoordinates = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://xgq5-ytpx-3wjn.n7c.xano.io/api:7j4-r1kq/gpslocation');
      const data = await response.json();
      const filteredCoords = filterCoordinates(data);
      if (filteredCoords.length > 0) {
        setCoordinates(filteredCoords);
        focusOnLastCoordinate(filteredCoords);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCoordinates = (data) => {
    const thresholdTime = new Date().getTime() - (selectedHours * 60 * 60 * 1000); // Convert hours to milliseconds

    return data
      .filter(item => new Date(item.created_at).getTime() > thresholdTime)
      .map(item => JSON.parse(item.data))
      .filter((item, index, array) => {
        if (index === 0) {
          previousItem = item;
          return false; // Skip the first item, as there's no previous item to compare with
        }

        // Check if the latitude or longitude is further than the specified thresholds
        const isLatitudeFarEnough = Math.abs(item.lat - previousItem.lat) > 0.000100;
        const isLongitudeFarEnough = Math.abs(item.lng - previousItem.lng) > 0.000100;

        previousItem = item; // Update previousItem to the current item for the next iteration
        return isLatitudeFarEnough || isLongitudeFarEnough;
      })
      .map(item => ({ latitude: item.lat, longitude: item.lng }));
  };

  const focusOnLastCoordinate = (coords) => {
    const lastCoord = coords[coords.length - 1];
    setRegion({
      latitude: lastCoord.latitude,
      longitude: lastCoord.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.001,
    });
  };
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
      <Dropdown
        style={styles.dropdown}
        data={timeOptions}
        labelField="label"
        valueField="value"
        value={selectedHours}
        onChange={item => setSelectedHours(item.value)}
      />
      </View>
      <MapView
        initialRegion={region}
        style={styles.mapContainer}>
        {coordinates.map((coord, index) => (
          <Polyline
            key={index}
            coordinates={coordinates}
            strokeColor="orange"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
            miterLimit={1}
            geodesic={true}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "white",
    paddingTop: 10, // Adjust this to avoid overlap with status bar on Android
  },
  mapContainer: {
    flex: 1,
    width: '100%'
  },
  dropdownContainer: {
    flex: 0.1,
    width: "90%",  
    // backgroundColor: "white",
  },
  dropdown: {
    width: "200",
    height: 50,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "white",
    // borderBottomColor: 'gray',
    // borderBottomWidth: 0.5

  }
});