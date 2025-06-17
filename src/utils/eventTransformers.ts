
import { Event } from "@/hooks/useEvents";

// Safe date transformation function
export const createSafeDate = (dateString: string, timeString?: string): string => {
  try {
    // Default time if not provided
    const time = timeString || '20:00';
    const dateTimeString = `${dateString}T${time}`;
    const date = new Date(dateTimeString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateTimeString}, using current date`);
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error creating date:', error);
    return new Date().toISOString();
  }
};

// Transform mock events to match the Event interface
export const transformMockEventToEvent = (mockEvent: any): Event => ({
  id: mockEvent.id,
  title: mockEvent.title,
  description: mockEvent.description || '',
  venue_name: mockEvent.venue,
  venue_address: mockEvent.address,
  start_time: createSafeDate(mockEvent.date, mockEvent.time),
  end_time: createSafeDate(mockEvent.date, '23:59'),
  cover_image_url: mockEvent.image,
  ticket_price: mockEvent.price,
  ticket_capacity: mockEvent.maxCapacity,
  tickets_sold: mockEvent.ticketsSold || 0,
  status: mockEvent.isLive ? 'live' : 'published',
  organizer_id: 'mock-organizer',
  stream_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  // Compatibility properties
  date: mockEvent.date,
  time: mockEvent.time,
  venue: mockEvent.venue,
  address: mockEvent.address,
  price: mockEvent.price,
  capacity: mockEvent.maxCapacity,
  attendees: mockEvent.ticketsSold,
  image: mockEvent.image,
  lineup: mockEvent.lineup || [],
  ticketsSold: mockEvent.ticketsSold,
  maxCapacity: mockEvent.maxCapacity,
  promoter: mockEvent.promoter?.name,
  isLive: mockEvent.isLive
});
