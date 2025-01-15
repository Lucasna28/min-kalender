export interface Event {
  id: string
  created_at: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  color?: string
  is_all_day: boolean
  start_date: string
  end_date: string
  location?: string
}

export type CreateEventInput = Omit<
  Event,
  'id' | 'created_at' | 'user_id'
> 