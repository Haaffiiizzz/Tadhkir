import { Stack } from "expo-router";

export default function RootLayout() {
  return (<Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="GetUserInfo" options={{ headerShown: false }} />
              <Stack.Screen name="GetUserLocation" options={{ headerShown: false }} />
              <Stack.Screen name="OtherDay" options={{headerBackButtonDisplayMode:"minimal", headerTitle: "", headerStyle: { backgroundColor: '#25292e' }}}/>
              <Stack.Screen name="+not-found" />
          </Stack>
  );

}
