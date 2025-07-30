import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.apiKey ?? '';
const screenWidth = Dimensions.get('window').width;

export default function CoinScreen() {
  const { symbol } = useLocalSearchParams();
  const router = useRouter();
  const symbolStr = Array.isArray(symbol) ? symbol[0] : symbol ?? '';

  const [price, setPrice] = useState<string | null>(null);
  const [instrumentName, setInstrumentName] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });
  const [interval, setInterval] = useState<'1day' | '1week'>('1day');

  const labels = interval === '1day'
  ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];

  useEffect(() => {
    const fetchData = async () => {
      setTooltipPos({ x: 0, y: 0, visible: false, value: 0 }); // Reset tooltip

      // 1. Get instrument name
      try{
        const nameRes = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${symbolStr.toUpperCase()}&apikey=${apiKey}`);
        const nameData = await nameRes.json();
        if (nameData.data && nameData.data.length > 0) {
          setInstrumentName(nameData.data[0].instrument_name);
        } else {
          setInstrumentName(symbolStr.toUpperCase());
        }
      // 2. Get price
        const priceRes = await fetch(`https://api.twelvedata.com/price?symbol=${symbolStr.toUpperCase()}&apikey=${apiKey}`);
        const priceData = await priceRes.json();
        if(priceData.price){
          setPrice(priceData.price);
        } else{
          setPrice(null);
        }
      // 3. Get chart data for interval (daily or weekly)
      const chartRes = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${symbolStr.toUpperCase()}&interval=${interval}&outputsize=7&apikey=${apiKey}`
      );
      const chartData = await chartRes.json();
      console.log("Chart API response:", chartData);
      if (chartData?.values) {
        const prices = chartData.values.reverse().map((item: any) => parseFloat(item.close));
        setPriceData(prices);
      } else {
        setPriceData([]);
      }  
      } catch (error) {
        console.error("Error fetching coin details:", error);
        setPrice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
}, [symbolStr, interval]);


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <FontAwesome5 name='bitcoin' size={50} color="#FF8C04" />
          <View style={styles.headertextContainer}>
            <Text style={styles.header} numberOfLines={1} adjustsFontSizeToFit>
              {symbolStr.toUpperCase()}
            </Text>
            <Text style={styles.details} numberOfLines={1} adjustsFontSizeToFit>
              {instrumentName}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push('/favorites')}>
          <Ionicons name="heart-outline" size={28} color="#FF8C04" />
        </TouchableOpacity>
      </View>

      <View style={styles.textContainer}>
          {loading ? (
            <Text style={styles.details}>Loading...</Text>
          ) : (
            <>
              {price ? (
                <Text style={styles.priceHeader}>${parseFloat(price).toFixed(2)}</Text>
              ) : (
                <Text style={styles.details}>Price unavailable</Text>
              )}
            </>
          )}
        </View>
      {/* Add charts, historical data, transactions, etc. */}
      <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Statistics</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setInterval(interval === '1day' ? '1week' : '1day')}
          >
            <Text style={styles.toggleText}>{interval === '1day' ? 'Daily' : 'Weekly'}</Text>
          </TouchableOpacity>
        </View>

         {loading ? (
          <ActivityIndicator size="large" color="#FFA500" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            style={{ marginLeft: -30, marginTop: 20, paddingRight: 50, paddingLeft:5 }}
            data={{
              labels,
              datasets: [{ data: priceData }],
            }}
            width={screenWidth * 1.5}
            height={260}
            withVerticalLines={false}
            withInnerLines={false}
            withDots
            yLabelsOffset={10}
            chartConfig={{
              backgroundGradientFrom: '#f5f7f9',
              backgroundGradientTo: '#f5f7f9',
              fillShadowGradient: '#FFA500',
              fillShadowGradientOpacity: 0.2,
              decimalPlaces: 0,
              color: () => '#FFA500',
              labelColor: () => '#666',
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#FFA500',
              },
            }}
            bezier
            onDataPointClick={(data) => {
              const isSamePoint = tooltipPos.x === data.x && tooltipPos.y === data.y;
              setTooltipPos({
                x: data.x,
                y: data.y,
                value: data.value,
                visible: !isSamePoint,
              });
            }}
            decorator={() => {
              return tooltipPos.visible ? (
                <View>
                  <View
                    style={{
                      position: 'absolute',
                      top: tooltipPos.y - 30,
                      left: tooltipPos.x + 30,
                      backgroundColor: '#fff',
                      padding: 6,
                      borderRadius: 6,
                      borderColor: '#FFA500',
                      borderWidth: 1,
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    }}
                  >
                    <Text style={{ color: '#FFA500', fontWeight: 'bold' }}>+ ${tooltipPos.value}</Text>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      top: tooltipPos.y - 3,
                      left: tooltipPos.x - 1,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#FFA500',
                    }}
                  />
                </View>
              ) : null;
            }}
          />
          </ScrollView>
        )}
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
    alignItems: 'center',
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 15,
    padding: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-between',
},
  headertextContainer: {
    flexDirection: 'column',
    marginLeft: 15,
    maxWidth: '70%',
},
  header: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  details: {
    color: '#9b9b9b',
    fontSize: 18,
    marginTop: 5,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginTop: 10,
  },

  priceHeader: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 20,
    margin: 10,
    width: '95%',
    marginTop: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',

  },
  toggleButton: {
    borderColor: '#FFA500',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  toggleText: {
    color: '#FFA500',
    fontWeight: '600',
  },
});
