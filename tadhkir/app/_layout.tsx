import { Stack } from "expo-router";

export default function RootLayout() {
  return (<Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="userName" options={{ headerShown: false }} />
              <Stack.Screen name="userLocation" options={{ headerShown: false }} />
              <Stack.Screen name="prayerDay" options={{headerBackButtonDisplayMode:"minimal", headerTitle: ""}}/>
              <Stack.Screen name="+not-found" />
          </Stack>
  );

}
