import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from 'native-base'

import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

import LogoSvg from '@assets/logo.svg'
import bacgroundImg from '@assets/background.png'

import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '@hooks/useAuth'
import { AppError } from '@utils/AppError'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

type FormDate = {
  email: string
  password: string
}

const signUpSchema = yup.object({
  email:yup.string().required('E-mail obrigatório.'),
  password: yup.string().required('Informe a senha.'),
})

export function SignIn () {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const navigation = useNavigation<AuthNavigatorRoutesProps>()
  const { control, handleSubmit, formState: {errors} } = useForm<FormDate>({
    resolver: yupResolver(signUpSchema)
  })
  const toast = useToast()

  function handleNewAccount() {
    navigation.navigate('SignUp')
  }

  async function handleSignIn({email, password}: FormDate) {
    try {
      setIsLoading(true)
      await signIn(email, password)
    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError ? error.message : 'Não foi possivel entrar. Tente novamente mais tarde.'
      setIsLoading(false)

      toast.show({
        title,
        placement: 'top',
        bgColor:'red.500'
      })
    }
  }

  return (
    <ScrollView 
    contentContainerStyle={{flexGrow: 1}}
    showsVerticalScrollIndicator={false}
    >  
    <VStack flex={1} px={10} pb={16}>
      <Image
        source={bacgroundImg}
        defaultSource={bacgroundImg}
        alt='Pessoas treinando'
        resizeMode='contain'
        position={'absolute'}
      />
      <Center my={24}>
      <LogoSvg/>

      <Text color='gray.100' fontSize='sm'>
        Treine sua mente e o seu corpo
      </Text>
      </Center>
       
      <Center>
        <Heading color='gray.100' fontSize='xl' mb={6} fontFamily="heading">
          Acesse sua conta
        </Heading>
        
        <Controller
          name='email'
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input 
            placeholder='E-mail'
            keyboardType='email-address'
            autoCapitalize='none'
            onChangeText={onChange}
            value={value}
            />
          )}
        />

        <Controller
          name='password'
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input 
            placeholder='Senha'
            secureTextEntry
            onChangeText={onChange}
            value={value}
            />
          )}
        />

        <Button  
        title='Acessar'
        isLoading={isLoading}
        onPress={handleSubmit(handleSignIn)}
        />
      </Center> 
        
        <Center mt={24}>
        <Text 
        color='gray.100' 
        fontSize='sm' 
        mb={3} 
        fontFamily='body'
        >
          Ainda não tem acesso?
        </Text>

        <Button  
        title='Criar conta' 
        variant='outline'
        onPress={handleNewAccount}
        />
        </Center>
    </VStack>
    </ScrollView>
  )
}