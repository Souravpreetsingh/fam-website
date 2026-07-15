import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateRoom, useUpdateRoom, useUploadRoomImages, useDeleteRoomImage } from '../api/adminHooks'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { adminApi } from '../api/adminApi'
import type { Room } from '../../types'

const roomSchema = z.object({
  name: z.string().min(2, 'Name required').max(100),
  description: z.string().min(10).max(2000),
  shortDescription: z.string().max(300).default(''),
  pricePerNight: z.coerce.number().min(1, 'Price required'),
  discountPrice: z.coerce.number().nullable().optional(),
  capacityAdults: z.coerce.number().min(1),
  capacityChildren: z.coerce.number().min(0),
  maxGuests: z.coerce.number().min(1),
  size: z.coerce.number(),
  bedType: z.string(),
  amenities: z.string().default(''),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  totalRooms: z.coerce.number().min(1),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  cancellationPolicy: z.string().default(''),
})

type RoomFormData = z.infer<typeof roomSchema>

export default function RoomForm({ roomId, onClose }: { roomId?: string | null; onClose: () => void }) {
  const isEdit = !!roomId
  const createMutation = useCreateRoom()
  const updateMutation = useUpdateRoom()
  const uploadMutation = useUploadRoomImages()
  const deleteImageMutation = useDeleteRoomImage()

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<{ public_id: string; url: string }[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(roomSchema),
  })

  useEffect(() => {
    if (!roomId) return
    setLoading(true)
    adminApi.rooms({}).then(({ data: res }) => {
      const found = res.data?.rooms?.find((r: Room) => r._id === roomId)
      if (found) {
        setImages(found.images || [])
        reset({
          name: found.name,
          description: found.description,
          shortDescription: found.shortDescription || '',
          pricePerNight: found.pricePerNight,
          discountPrice: found.discountPrice,
          capacityAdults: found.capacity.adults,
          capacityChildren: found.capacity.children,
          maxGuests: found.capacity.maxGuests,
          size: found.size,
          bedType: found.bedType,
          amenities: (found.amenities || []).join(', '),
          isAvailable: found.isAvailable,
          isFeatured: found.isFeatured,
          totalRooms: found.totalRooms,
          checkInTime: found.checkInTime,
          checkOutTime: found.checkOutTime,
          cancellationPolicy: found.cancellationPolicy || '',
        })
      }
    }).finally(() => setLoading(false))
  }, [roomId, reset])

  const onSubmit = async (raw: Record<string, unknown>) => {
    const d = raw as unknown as RoomFormData
    const payload = {
      name: d.name,
      description: d.description,
      shortDescription: d.shortDescription || undefined,
      pricePerNight: d.pricePerNight,
      discountPrice: d.discountPrice || undefined,
      capacity: { adults: d.capacityAdults, children: d.capacityChildren, maxGuests: d.maxGuests },
      size: d.size,
      bedType: d.bedType,
      amenities: d.amenities ? d.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
      isAvailable: d.isAvailable,
      isFeatured: d.isFeatured,
      totalRooms: d.totalRooms,
      checkInTime: d.checkInTime,
      checkOutTime: d.checkOutTime,
      cancellationPolicy: d.cancellationPolicy || undefined,
    }

    let savedRoom: { room: Room } | undefined
    if (isEdit && roomId) {
      savedRoom = await updateMutation.mutateAsync({ id: roomId, data: payload })
    } else {
      savedRoom = await createMutation.mutateAsync(payload as Parameters<typeof createMutation.mutateAsync>[0])
    }

    if (newFiles.length > 0 && savedRoom?.room?._id) {
      await uploadMutation.mutateAsync({ id: savedRoom.room._id, files: newFiles })
    }

    onClose()
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!roomId) return
    await deleteImageMutation.mutateAsync({ roomId, imageId })
    setImages((prev) => prev.filter((img) => img.public_id !== imageId))
  }

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><LoadingSpinner size="lg" /></div>

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl my-8 rounded-2xl border border-white/10 bg-[#0C0E12] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-display text-xl">{isEdit ? 'Edit Room' : 'Create Room'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round"/></svg></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-white/60 text-xs font-medium mb-1">Name</label>
              <input type="text" {...register('name')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-xs font-medium mb-1">Description</label>
              <textarea rows={4} {...register('description')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50 resize-none" />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-xs font-medium mb-1">Short Description</label>
              <textarea rows={2} {...register('shortDescription')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50 resize-none" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Price per Night (₹)</label>
              <input type="number" {...register('pricePerNight')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
              {errors.pricePerNight && <p className="text-xs text-red-400 mt-1">{errors.pricePerNight.message}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Discount Price (₹)</label>
              <input type="number" {...register('discountPrice')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Max Adults</label>
              <input type="number" {...register('capacityAdults')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Max Children</label>
              <input type="number" {...register('capacityChildren')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Max Guests</label>
              <input type="number" {...register('maxGuests')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Size (sq ft)</label>
              <input type="number" {...register('size')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Bed Type</label>
              <input type="text" {...register('bedType')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Total Rooms</label>
              <input type="number" {...register('totalRooms')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-xs font-medium mb-1">Amenities (comma separated)</label>
              <input type="text" {...register('amenities')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" placeholder="WiFi, TV, AC, Pool" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-xs font-medium mb-1">Cancellation Policy</label>
              <textarea rows={2} {...register('cancellationPolicy')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50 resize-none" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isAvailable')} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#2E5E4E]" />
                <span className="text-white/60 text-sm">Available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#2E5E4E]" />
                <span className="text-white/60 text-sm">Featured</span>
              </label>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Check-in Time</label>
              <input type="text" {...register('checkInTime')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Check-out Time</label>
              <input type="text" {...register('checkOutTime')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2">Images</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((img) => (
                  <div key={img.public_id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleDeleteImage(img.public_id)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" multiple accept="image/*" onChange={(e) => setNewFiles(Array.from(e.target.files || []))} className="text-sm text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-[#2E5E4E] text-white text-sm font-medium hover:bg-[#3a705e] disabled:opacity-50 transition-all flex items-center gap-2">
              {isSubmitting ? <LoadingSpinner size="sm" /> : null}
              {isEdit ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
