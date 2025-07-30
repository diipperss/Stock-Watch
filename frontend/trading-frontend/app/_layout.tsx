import { Stack } from "expo-router";
import { UserProvider } from './context/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Login" }}
        />
        <Stack.Screen
          name="[symbol]"
          options={{ headerShown: false, title: "Coin Details" }}
        />
        <Stack.Screen
          name="favs"
          options={{ headerShown: false, title: "Favorites" }}
        />
      </Stack>
    </UserProvider>
  );
}
