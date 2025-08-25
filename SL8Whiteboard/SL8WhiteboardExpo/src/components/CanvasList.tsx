import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";

interface GreetingScreenProps {
  name: string;
}

interface Item {
  id: number;
  text: string;
}

const API_URL = "http://localhost:8080/sl8-backend/api/items.php"; // replace with your API endpoint

const GreetingScreen: React.FC<GreetingScreenProps> = ({ name }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data.status === "success") {
          setItems(response.data.items); // expects { items: [{id, text}, ...] }
        } else {
          Alert.alert("Error", response.data.message || "Failed to load items");
        }
      } catch (error: any) {
        console.log(error);
        Alert.alert("Error", "Unable to fetch items from server");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {name}!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.listItem}>
              {index + 1}. {item.text}
            </Text>
          )}
        />
      )}
    </View>
  );
};

export default GreetingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  listItem: {
    fontSize: 18,
    marginBottom: 10,
    color: "#555",
  },
});
