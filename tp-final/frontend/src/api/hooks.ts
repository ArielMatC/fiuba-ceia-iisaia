import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type { ForecastDetail, ForecastRequest } from './types'

export const wellKeys = {
  all: ['wells'] as const,
  detail: (id: number) => ['wells', id] as const,
  production: (id: number) => ['wells', id, 'production'] as const,
  forecasts: (id: number) => ['wells', id, 'forecasts'] as const,
}

export const forecastKeys = {
  detail: (id: number) => ['forecasts', id] as const,
}

export function useWells() {
  return useQuery({ queryKey: wellKeys.all, queryFn: api.listWells })
}

export function useWell(id: number) {
  return useQuery({ queryKey: wellKeys.detail(id), queryFn: () => api.getWell(id) })
}

export function useProduction(id: number) {
  return useQuery({ queryKey: wellKeys.production(id), queryFn: () => api.getProduction(id) })
}

export function useForecasts(id: number) {
  return useQuery({ queryKey: wellKeys.forecasts(id), queryFn: () => api.listForecasts(id) })
}

export function useForecastDetail(id: number | null) {
  return useQuery({
    queryKey: id === null ? ['forecasts', null] : forecastKeys.detail(id),
    queryFn: () => api.getForecast(id as number),
    enabled: id !== null,
  })
}

export function useForecastDetails(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: forecastKeys.detail(id),
      queryFn: () => api.getForecast(id),
    })),
  })
}

export function useUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, unit }: { file: File; unit: string }) => api.uploadCsv(file, unit),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wellKeys.all }),
  })
}

export function useDeleteWell() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteWell(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wellKeys.all }),
  })
}

export function useCreateForecast(wellId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ForecastRequest) => api.createForecast(wellId, body),
    onSuccess: (forecast: ForecastDetail) => {
      queryClient.setQueryData(forecastKeys.detail(forecast.id), forecast)
      queryClient.invalidateQueries({ queryKey: wellKeys.forecasts(wellId) })
      queryClient.invalidateQueries({ queryKey: wellKeys.all })
    },
  })
}

export function useDeleteForecast(wellId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteForecast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellKeys.forecasts(wellId) })
      queryClient.invalidateQueries({ queryKey: wellKeys.all })
    },
  })
}
