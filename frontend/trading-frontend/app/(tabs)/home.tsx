import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, FlatList   } from 'react-native';
import React, { useState,useEffect,useContext, use } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.apiKey ?? '';
export default function HomeScreen() {


  const symbolNameMap: { [key: string]: string } = {
    AAPL: 'apple',
    TSLA: 'car',
    BTCUSD: 'bitcoin',
    ETHUSD: 'ethereum',
    SOLUSD: 'solana',
    // Add more mappings as needed
  };
  type Wallet = {
    id: number;
    stockSymbol: string;
    amount: number;
    change: number;
  };

  const router = useRouter();

  type Activity = {
    symbol: string;
    percentChange: string;
    valueChange: string;
  };

  const [activities, setActivities] = useState<Activity[]>([]);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [percentChanges, setPercentChanges] = useState({});
  const [total, setTotal] = useState(0);

  const { user, setUser } = useUser();
  
  useEffect(() => {
     if (!user) return;
    // Fetch wallets from the context or API
    const fetchWallets = async () => {
      try {
        console.log('userid:', user.userId);
        const response = await fetch(`http://192.168.1.16:8081/api/wallets/${user.userId}`);
        const total_response = await fetch(`http://192.168.1.16:8081/api/wallets/balance/${user.userId}`);
        const data = await response.json();
        const total_data = await total_response.json();

        setWallets(data);
        setTotal(total_data);

      } catch (error) {
        console.error('Error fetching wallets:', error);
      }
    };

    fetchWallets();
  }, [user]);

  useEffect(() => {
    async function fetchChanges() {
      const changes = {};
      for (const wallet of wallets) {
        try {
          const res = await fetch(`https://api.twelvedata.com/quote?symbol=${wallet.stockSymbol}&apikey=${apiKey}`);
          const data = await res.json();
          wallet.change = parseFloat(data.percent_change);
          console.log(wallet.stockSymbol, data);

        } catch (err) {
          wallet.change = 0;
        }
      }
      setPercentChanges(changes);
    }
    fetchChanges();
  }, [wallets]);

  const fetchActivityData = async () => {
  try {
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=BTC/USD,ETH/USD,SOL/USD&apikey=${apiKey}`
    );
    const data = await response.json();

    const updatedActivities: Activity[] = Object.values(data).map((item: any) => ({
      symbol: item.symbol,
      percentChange: `${item.percent_change}%`,
      valueChange: item.change
    }));

    setActivities(updatedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
};

useEffect(() => {
  fetchActivityData();

  const intervalId = setInterval(() => {
    fetchActivityData();
  }, 15000); // 15 seconds

  return () => clearInterval(intervalId);
}, []);

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.smallHeader}>Your Balance</Text>
        <Text style={{...styles.priceChange, color: '#653434ff'}}>- 2.5%</Text>
      </View>
      <Text style={styles.totalMoney}>$ {total.toFixed(2)}</Text>
      <View style={styles.changeContainer}>
        <Text style={styles.Header}>Recent Activities</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
         {activities.map((activity, index) => (
            <TouchableOpacity key={index} style={styles.activityCard} 
              onPress={() => router.push({
                pathname: '/[symbol]',
                params: { symbol: activity.symbol }
            })}>
                <Text style={styles.activityTextTop}>{activity.symbol}</Text>
                <Text style={styles.activityTextTop}>{activity.percentChange}</Text>
              <Text style={styles.activityTextBottom}>{activity.valueChange}</Text>
            </TouchableOpacity>

          ))}
        </ScrollView>
      </View>
      <View style={styles.subContainer}>
        <Text style={{ ...styles.Header, color: '#000', marginBottom: 20 }}>Your Wallet</Text>

        <FlatList
          data={wallets}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View style={styles.walletCard}>
              <FontAwesome5 name={symbolNameMap[item.stockSymbol.toUpperCase()] || item.stockSymbol.toUpperCase()} size={40} style={{ marginBottom: 10, color: 'grey' }} />
              <Text style={styles.walletName}>{item.stockSymbol.toUpperCase()}</Text>
              <Text style={styles.walletBalance}>{item.amount}</Text>
              {item.change > 0 ? (
                <Text style={{ ...styles.walletChange, color: 'green' }}>+{item.change}%</Text>
              ) : (
                <Text style={{ ...styles.walletChange, color: 'red' }}>{item.change}%</Text>
              )}
            </View>
          )}
        />
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#2a2640',
    paddingTop: '20%',         
    alignItems: 'flex-start' 
  },
  headerContainer:{
    marginTop: 50,
    marginLeft: '5%',
    justifyContent: 'flex-start',
    flexDirection: 'row'
  },
  smallHeader: {
    color: '#4f5364',
    fontSize: 22,
    fontWeight: '600',
  },
  priceChange: {
    color: '#346365',
    fontSize: 22,
    marginLeft: 10,
    fontWeight: '600',

  },
  totalMoney:{
    color: '#fff',
    fontSize: 30,
    marginTop: '3%',
    fontWeight: 'bold',
    marginLeft: '5%',
  },
  Header: {
    color: '#fff',
    fontSize: 24,
    marginTop: '3%',
    marginBottom: 10,
    fontWeight: '600',

  },
  changeContainer:{
    width: '100%',
    height: '30%',
    marginTop: '10%',
    backgroundColor: '#FF8C04',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
  },
  activityCard: {
    marginTop:10,
    width: 150,
    height: 100,
    borderRadius: 20,
    borderColor: '#ffa126',
    borderWidth: 1,
    backgroundColor: '#ff961c',
    padding: 10,
    marginRight: 15,
    justifyContent: 'space-between',
    shadowColor: '#754a12ff',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
   activityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityTextTop: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activityTextBottom: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subContainer:{
    width: '100%',
    flex: 1,
    marginTop: '-7%',
    backgroundColor: '#f8f9fd',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
  },
  walletCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 10,
  },
  walletName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'grey',
    marginTop: 5,
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
  },
  walletChange: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
  },

});
