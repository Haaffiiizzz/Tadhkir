import { Stack } from "expo-router";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function RootLayout() {
  return (<ThemeProvider><Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="GetUserInfo" options={{ headerShown: false }} />
              <Stack.Screen name="GetUserLocation" options={{ headerShown: false }} />
              <Stack.Screen name="OtherDay" options={{headerBackButtonDisplayMode:"minimal", headerTitle: "", headerStyle: { backgroundColor: '#25292e' }, headerShadowVisible: false}}/>
              <Stack.Screen name="+not-found" />
          </Stack>
          </ThemeProvider>
  );

}
