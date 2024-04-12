import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, ActivityIndicator, Pressable, TouchableHighlight, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const mapRef = useRef(null);
  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // State to track loading

  useEffect(() => {
    fetchLastNonEmptyObject(); // Initial fetch
  }, []);

  const fetchLastNonEmptyObject = async () => {
    setIsLoading(true); // Set loading to true when fetching starts
    try {
      const response = await fetch('https://xgq5-ytpx-3wjn.n7c.xano.io/api:7j4-r1kq/gpslocation');
      const data = await response.json();

      const lastNonEmpty = data.reverse().find(item => {
        if (item && typeof item.data === 'string') {
          const parsedData = JSON.parse(item.data);
          return parsedData.lat && parsedData.lng;
        }
        return false;
      });

      if (lastNonEmpty) {
        const parsedData = JSON.parse(lastNonEmpty.data);
        setRegion({
          latitude: Number(parsedData.lat),
          longitude: Number(parsedData.lng),
          latitudeDelta: 0.008,
          longitudeDelta: 0.004
        });
        setMarker({
          latitude: Number(parsedData.lat),
          longitude: Number(parsedData.lng),
          title: `Location ID: ${lastNonEmpty.id}`,
          description: `Created on ${new Date(lastNonEmpty.created_at).toLocaleDateString()}`
        });
        setLastUpdated(`Last Updated: ${new Date().toLocaleTimeString()}`);
      } else {
        console.error('No valid locations found.');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false); // Set loading to false once the fetch is complete
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
            coordinate={marker}
            title={marker.title}
            description={marker.description}
          />
        )}
      </MapView>
      <View style={styles.floatingBox}>
        <Text style={styles.infoText}>🐱 {lastUpdated}</Text>
        <TouchableOpacity
          onPress={fetchLastNonEmptyObject}
          style={{ backgroundColor: "#2e7bff", padding: "3%", borderRadius: 10, }}>
          <Text style={{ fontSize: 18, color: "white" }}>Refresh</Text>
        </TouchableOpacity>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2b1900" />
        </View>
      )}
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
    flex: 1,
    width: '100%',
    height: '100%',
  },
  floatingBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)'  // Optional: adds a semi-transparent overlay
  },
  infoText: {
    fontSize: 16
  }
});
