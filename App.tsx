import { StatusBar } from 'expo-status-bar';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { NativeBaseProvider } from 'native-base';
import { Loading } from '@components/Loading';
import { THEME } from 'src/theme';
import { Routes } from '@routes/index';
import { AuthContexProvider } from '@contexts/AuthContext';

import { OneSignal } from 'react-native-onesignal';

OneSignal.initialize("95c463b7-68db-47dc-92a4-6241731547ec")
OneSignal.Notifications.requestPermission(true)

export default function App() {

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold
  });

  return (
   <NativeBaseProvider theme={THEME}>
    <StatusBar
      style='light'
      backgroundColor='transparent'
      translucent
    />
    <AuthContexProvider>
      {fontsLoaded ? <Routes/> : <Loading/>}
    </AuthContexProvider>
   </NativeBaseProvider>
  );
}


