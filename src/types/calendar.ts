export type CalendarViewType = "day" | "week" | "month" | "year";

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  is_all_day: boolean;
  user_id: string;
  calendar_id: string;
  color?: string;
  location?: string;
}

export type CreateEventData = Omit<Event, "id" | "user_id">;

export interface CalendarViewProps {
  date: Date;
  view: CalendarViewType;
  events: Event[];
  onEventClick: (event: Event | null) => void;
  onEventCreate: (event: Omit<Event, "id" | "userId">) => Promise<void>;
  onEventUpdate: (event: Event) => Promise<void>;
  onEventDelete: (eventId: string) => Promise<void>;
}

export interface NavbarProps {
  date: Date;
  view: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onMenuClick: () => void;
}

export interface CalendarState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  view: CalendarViewType;
  date: Date;
  selectedEvent: Event | null;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  className?: string;
  children?: React.ReactNode;
}
