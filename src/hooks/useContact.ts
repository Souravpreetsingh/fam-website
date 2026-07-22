import { useMutation } from '@tanstack/react-query'
import { contactApi } from '../api/contact'
import toast from 'react-hot-toast'

export function useContactForm() {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; subject: string; message: string }) => {
      const { data: res } = await contactApi.submit(data)
      return res
    },
    onSuccess: () => toast.success('Message sent successfully!'),
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to send message')
    },
  })
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await contactApi.subscribeNewsletter(email)
      return data
    },
    onSuccess: () => toast.success('Subscribed to newsletter!'),
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to subscribe')
    },
  })
}
