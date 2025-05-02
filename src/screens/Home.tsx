import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { HStack, Text, VStack, FlatList, Heading, useToast } from "native-base";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@hooks/useAuth";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

export function Home () {
  const [isLoading, setIsLoading] = useState(true)
  const [groupSelected, setGroupSelected] = useState('costas')
  const [groups, setGroups] = useState<string[]>([])
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])

  const { user } = useAuth()
  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleOpenExerciseDetails(exerciseId: string) {
    navigation.navigate('Exercise', { exerciseId })
  }

  async function fetchGroup() {
    try {
      const response = await api.get('/groups')
      setGroups(response.data)

    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError ? error.message : 'Não foi possivel carregar os grupos musculares.'

      toast.show({
        title,
        placement: 'top',
        bgColor:'red.500'
      })
    }
  }

  async function fetchExercisesByGroup() {
    try {
      setIsLoading(true)

      const response = await api.get(`/exercises/bygroup/${groupSelected}`)
      setExercises(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError ? error.message : 'Não foi possivel carregar os exercícios.'

      toast.show({
        title,
        placement: 'top',
        bgColor:'red.500'
      })
    } finally {
      setIsLoading(false)
    }
  }  

  useEffect(() => {
    fetchGroup()
  }, [])

  useFocusEffect(useCallback(() => {
    fetchExercisesByGroup()
  }, [groupSelected]))

  return (
    <VStack flex={1}>
      <HomeHeader/>
      
      <FlatList
        data={groups}
        keyExtractor={item => item}
        renderItem={({item}) => (

        <Group 
        name={item} 
        isActive={groupSelected === item}
        onPress={() => setGroupSelected(item)}
        />

        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{px: 8}}
        my={10}
        maxH={10}
        minH={10}
      />
      
      {isLoading ? <Loading/> :
        <VStack flex={1} px={8}>

        <HStack justifyContent='space-between' mb={5}>
          <Heading color='gray.200' fontSize='md' fontFamily='heading'>
            Exercicios
          </Heading>

          <Text color='gray.200' fontSize='sm'>
            {exercises.length}
          </Text>
        </HStack>

        <FlatList
          data={exercises}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ExerciseCard
              onPress={() => handleOpenExerciseDetails(item.id)}
              data={item}
            />
          )}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ paddingBottom: 20}}
        />
        </VStack>
      }
    </VStack>
  )
}