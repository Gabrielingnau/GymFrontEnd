import { HStack, Heading, Text, VStack, Icon, Pressable, } from "native-base";
import { MaterialIcons } from '@expo/vector-icons'

import { UserPhoto } from "./UserPhoto";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { useAuth } from "@hooks/useAuth";

import deafultUserPhotoImg from '@assets/userPhotoDefault.png'

import { api } from "@services/api";

export function HomeHeader() {

  const { user, signOut } = useAuth()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleProfile() {
    navigation.navigate('Profile')
  }

  return (
    <HStack bg='gray.600' pt={16} pb={5} px={8} alignItems='center'>

      <Pressable onPress={handleProfile}>
        <UserPhoto 
        source={
          user.avatar 
          ? {uri: `${api.defaults.baseURL}/avatar/${user.avatar}`}
          : deafultUserPhotoImg}
        alt='Imagem do usúario'
        size={16}
        mr={4}
        />
      </Pressable>

      <VStack flex={1}>
        <Text color='gray.100' fontSize='md'>
          Olá,
        </Text>

        <Heading color='gray.100' fontSize='md' fontFamily='heading'>
        {user.name}
        </Heading>
      </VStack>
      
      <TouchableOpacity onPress={signOut}>
      <Icon
        as={MaterialIcons}
        name="logout"
        color='gray.200'
        size={7}
      />
      </TouchableOpacity>

    </HStack>
  )
}