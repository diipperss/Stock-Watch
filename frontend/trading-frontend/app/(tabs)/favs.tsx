import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.apiKey ?? '';

export default function AllStocksScreen() {
  const { user } = useUser(); 
  const [query, setQuery] = useState('');
  type Stock = { symbol: string; name: string };
  const router = useRouter();

  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const stocksPerPage = 20;

  useEffect(() => {
    handleFilter();
  }, [query, favoritesOnly, allStocks]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!user) return; 
    try {
      console.log('userid:', user.userId);
      const res = await fetch(`http://192.168.1.16:8081/api/favorites/${user.userId}`);
      const data = await res.json();
      console.log('Favorites data:', data);

      const favoriteSymbols = data.map((fav: any) => fav.stockSymbol);
      console.log('Favorite symbols:', favoriteSymbols);
      setFavorites(favoriteSymbols);
      console.log('Favorite symbols:', favoriteSymbols);


      // Only fetch stocks once favorites are known
      fetchStocks(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

const fetchStocks = async (favoriteSymbols: string[]) => {
  setLoading(true);
  try {
    const res = await fetch(`https://api.twelvedata.com/stocks?exchange=NASDAQ&apikey=${apiKey}`);
    const data = await res.json();

    if (data.data) {
      const cleanedData = data.data
        .map((stock: any) => ({
          symbol: stock.symbol || 'UNKNOWN',
          name: stock.name || 'No Name',
        }))
        .filter((stock: Stock) => stock.symbol !== 'UNKNOWN' && stock.name !== 'No Name');
      const favoriteStocks = cleanedData.filter((stock: Stock) =>
        favoriteSymbols.includes(stock.symbol)
      );

      setAllStocks(favoriteStocks);
      setFilteredStocks(favoriteStocks);
    }
  } catch (error) {
    console.error("Error fetching stocks:", error);
  } finally {
    setLoading(false);
  }
};

  const handleFilter = () => {
    let result = allStocks;
    if (query) {
      result = result.filter((stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (favoritesOnly) {
      result = result.filter((stock) => favorites.includes(stock.symbol));
    }
    setFilteredStocks(result);
    setCurrentPage(1); // Reset page on filter
  };

  const toggleFavorite = async (symbol: string) => {
      if (!user) return;
      const isFavorite = favorites.includes(symbol);

      try {
        if (isFavorite) {
          // DELETE favorite
          await fetch(`http://192.168.1.16:8081/api/favorites/delete/${user.userId}/${symbol}`, {
            method: 'DELETE',
          });
          setFavorites((prev) => prev.filter((s) => s !== symbol));
        } 
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    };

const renderItem = ({ item }: { item: Stock }) => (
  <TouchableOpacity
    style={styles.stockItem}
    onPress={() => router.push(`/${item.symbol}`)}  // change to specific route
    activeOpacity={0.7}
  >
    <Text style={styles.symbol}>{item.symbol}</Text>
    <Text style={styles.name}>{item.name}</Text>
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();  // Prevent triggering the parent onPress
        toggleFavorite(item.symbol);
      }}
    >
      <Ionicons
        name={favorites.includes(item.symbol) ? 'heart' : 'heart-outline'}
        size={20}
        color="#FF8C04"
      />
    </TouchableOpacity>
  </TouchableOpacity>
);


  const totalPages = Math.ceil(filteredStocks.length / stocksPerPage);
  const paginatedData = filteredStocks.slice(
    (currentPage - 1) * stocksPerPage,
    currentPage * stocksPerPage
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search stocks..."
        placeholderTextColor="#fff"
        value={query}
        onChangeText={setQuery}
        style={styles.searchBar}
      />
      <View style={{ flexDirection: 'row'}}>
        <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/all')}>
          <Text style={styles.filterText}>All Stock</Text>
        </TouchableOpacity>

      <TouchableOpacity style={styles.filterActive}>
        <Text style={styles.filterTextActive}>Favourites</Text>
      </TouchableOpacity>
      </View>


      {loading ? (
        <ActivityIndicator size="large" color="#FF8C04" />
      ) : (
        <>
          <FlatList
            data={paginatedData}
            keyExtractor={(item) => item.symbol}
            renderItem={renderItem}
          />

          {filteredStocks.length === 0 && !loading && (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>No favorites found.</Text>
          )}

        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
    padding: 16,
  },
  searchBar: {
    backgroundColor: '#FF8C04',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    marginTop: '20%',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#FF8C04',
  },
  filterButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: '#FF8C04',
    borderWidth: 1,
    marginBottom: 10,
  },
  filterActive: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FF8C04',
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 10,
    marginRight: 10,
  },
  filterText: {
    color: '#FF8C04',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  stockItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderColor: '#2a2640',
    borderWidth: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  pageButton: {
    padding: 8,
    borderRadius: 6,
    borderColor: '#FF8C04',
    borderWidth: 1,
    marginHorizontal: 10,
  },
  disabledButton: {
    opacity: 0.4,
  },
  pageText: {
    color: '#FF8C04',
    fontWeight: '600',
  },
  pageNumber: {
    fontSize: 13,
    color: '#000',
  },
});
