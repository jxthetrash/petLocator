import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function CurrentPin() {
  const mapRef = useRef(null);
  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLastNonEmptyObject(); // Call your fetch function here
    }, 10000); // Polling every 10 seconds
    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  useEffect(() => {
    // Ensure mapRef.current and marker are valid before attempting to animate to region
    if (mapRef.current && marker) {
      mapRef.current.animateToRegion({
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }, 1500); // 1500 ms animation duration
    }
  }, [marker]); // Depend on marker

  const fetchLastNonEmptyObject = async () => {
    try {
      const response = await fetch('https://xgq5-ytpx-3wjn.n7c.xano.io/api:7j4-r1kq/gpslocation');
      const data = await response.json();

      const lastNonEmpty = data.reverse().find(item => {
        if (item && typeof item.data === 'string') {
          const parsedData = JSON.parse(item.data);
          return parsedData.lat && parsedData.lng; // Ensuring both latitude and longitude are present
        }
        return false;
      });

      if (lastNonEmpty) {
        const parsedData = JSON.parse(lastNonEmpty.data);
        const newRegion = {
          latitude: Number(parsedData.lat),
          longitude: Number(parsedData.lng),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        };
        setRegion(newRegion);
        setMarker({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
          title: `Location ID: ${lastNonEmpty.id}`,
          description: `Created on ${new Date(lastNonEmpty.created_at).toLocaleDateString()}`
        });
      } else {
        console.error('No valid locations found.');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        ref={mapRef}
      >
        {marker && (
          <Marker
            coordinate={region}
            title={marker.title}
            description={marker.description}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
