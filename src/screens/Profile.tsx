import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";

import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { TouchableOpacity } from "react-native";

import { useState } from "react";

import * as ImagePiker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { AppError } from "@utils/AppError";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";

import * as yup from 'yup'

import deafultUserPhotoImg from '@assets/userPhotoDefault.png'

type FormDataProps = {
  name: string;
  email: string
  password: string;
  old_password: string;
  confirm_password: string;
}

const profileSchema = yup.object({
  name: yup
    .string()
    .required('Informe o nome'),
  password: yup
    .string()
    .min(6, 'A senha deve ter pelo menos 6 dígitos.')
    .nullable()
    .transform((value) => !!value ? value : null),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => !!value ? value : null)
    .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
    .when('password', {
      is: (Field: any) => Field, 
      then: (schema) =>
			schema.nullable().required('Informe a confirmação da senha.')
      .transform((value) => !!value ? value : null),
	}),
})

export function Profile () {
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [isUpdatting, setIsUpdatting] = useState(false)

  const PHOTO_SIZE = 33;

  const toast = useToast()
  const {user, updateUserProfile} = useAuth()
  const {control, handleSubmit} = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email
    }  
  })

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true)
    try {
      const photoSelected = await ImagePiker.launchImageLibraryAsync({
        mediaTypes: ImagePiker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })
  
      if(photoSelected.canceled) {
        return;
      }
      
      if(photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri)

        if(photoInfo.exists && (photoInfo.size / 1024 / 1024) > 5) {
          return toast.show({
            title: "Essa imagem é muito grande. Escolha uma de até 5 MB",
            placement: 'top',
            bgColor: 'red.500'
          })
        }

        const fileExtension = photoSelected.assets[0].uri.split('.').pop()
        
        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`
        } as any

        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, { 
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const userUpdated = user
        userUpdated.avatar = avatarUpdatedResponse.data.avatar
        updateUserProfile(userUpdated)

        toast.show({
          title: 'Foto Atualizada!',
          placement: 'top',
          bgColor:'green.500',
        })
      }
    } catch (error) {
      console.log(error)
    }finally {
      setPhotoIsLoading(false)
    }
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdatting(true)

      const userUpdated = user
      userUpdated.name = data.name

      await api.put('/users', data)

      await updateUserProfile(userUpdated)

      toast.show({
        title: 'Perfil atualizado com sucesso',
        placement: 'top',
        bgColor:'green.500',
      })
    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError ? error.message : 'Não foi possivel atualizar os dados. Tente novamente mais tarde'

      toast.show({
        title,
        placement: 'top',
        bgColor:'red.500'
      })
    } finally {
      setIsUpdatting(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil"/>
      <ScrollView>
        <Center  mt={6} px={10}>
          {photoIsLoading ?
            <Skeleton 
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded='full'
              startColor='gray.500'
              endColor='gray.400'
            />
           :
           <UserPhoto 
           source={
            user.avatar 
            ? {uri: `${api.defaults.baseURL}/avatar/${user.avatar}`}
            : deafultUserPhotoImg}
             alt='Imagem do usúario'
             size={PHOTO_SIZE}
           />         
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color='green.500' fontWeight='bold' fontSize='md' mt={2} mb={8}>
              Alterar Foto
            </Text>
          </TouchableOpacity>
          
          <Controller
            name="name"
            control={control}
            render={({ field: {value, onChange}}) => (
              <Input 
                bg='gray.600'
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field: {value, onChange}}) => (
              <Input 
                bg='gray.600'
                placeholder="E-mail"
                onChangeText={onChange}
                value={value}
              />
            )}
          />

        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color='gray.200' fontSize='md' mb={2} fontFamily='heading'>
            Alterar senha
          </Heading>

          <Controller
            name="old_password"
            control={control}
            render={({ field: {value, onChange}}) => (
              <Input 
                bg='gray.600'
                placeholder="Senha antiga"
                secureTextEntry
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field: {value, onChange}}) => (
              <Input 
                bg='gray.600'
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Controller
            name="confirm_password"
            control={control}
            render={({ field: {value, onChange}}) => (
              <Input 
                bg='gray.600'
                placeholder="Confirme a nova senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Button
            title="Atualizar"
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isUpdatting}
            mt={4}
          />
        </VStack>
      </ScrollView>
    </VStack>
  )
}