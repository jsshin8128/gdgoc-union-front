import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import ArtistCarousel from "@/components/ArtistCarousel";
import Calendar from "@/components/Calendar";
import EventList from "@/components/EventList";
import BottomNav from "@/components/BottomNav";
import { SubscribedArtistWithConcerts } from "@/types/subscribedConcerts";
import { CalendarEvent } from "@/types/calendarEvent";
import { format, isSameDay } from 'date-fns';

const Index = () => {
  const [artists, setArtists] = useState<SubscribedArtistWithConcerts[]>([]);
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        // Mock Data for UI development
        const mockResponse = {
          success: true,
          data: {
            artists: [
              {
                artistId: 1,
                name: "실리카겔",
                profileImageUrl: "https://via.placeholder.com/150",
                subscribedAt: "2025-01-01T00:00:00Z",
                concerts: [
                  {
                    concertId: 101,
                    title: "실리카겔 연말 단독 콘서트",
                    place: "블루스퀘어 마스터카드홀",
                    performingSchedule: [
                      { id: 1, date: "2025-12-27T19:00:00Z" },
                      { id: 2, date: "2025-12-28T18:00:00Z" },
                    ],
                    bookingSchedule: "2025-12-10T14:00:00Z",
                    bookingUrl: "https://tickets.interpark.com/goods/25000001",
                    imageUrl: "https://via.placeholder.com/150/FFC0CB/000000?Text=Silica"
                  },
                ],
              },
              {
                artistId: 2,
                name: "파란노을",
                profileImageUrl: "https://via.placeholder.com/150/ADD8E6/000000?Text=Paran",
                subscribedAt: "2025-02-01T00:00:00Z",
                concerts: [
                  {
                    concertId: 102,
                    title: "After the Magic Tour",
                    place: "KT&G 상상마당",
                    performingSchedule: [
                      { id: 3, date: "2025-12-20T20:00:00Z" },
                    ],
                    bookingSchedule: "2025-12-08T20:00:00Z",
                    bookingUrl: "https://ticket.yes24.com/Perf/49001",
                    imageUrl: "https://via.placeholder.com/150/ADD8E6/000000?Text=Paran"
                  },
                ],
              },
            ],
          },
          message: "성공",
        };
        setArtists(mockResponse.data.artists);

      } catch (error) {
        console.error("Failed to fetch subscribed concerts:", error);
      }
    };

    fetchConcerts();
  }, []);

  const allCalendarEvents = useMemo((): CalendarEvent[] => {
    return artists.flatMap(artist =>
      artist.concerts.flatMap(concert => {
        const performanceEvents: CalendarEvent[] = concert.performingSchedule.map(schedule => ({
          artistId: artist.artistId,
          artistName: artist.name,
          artistProfileImageUrl: artist.profileImageUrl,
          concertId: concert.concertId,
          scheduleId: schedule.id,
          date: format(new Date(schedule.date), 'yyyy-MM-dd'),
          dateTime: schedule.date,
          title: concert.title,
          place: concert.place,
          type: 'performance',
          bookingUrl: concert.bookingUrl,
          imageUrl: concert.imageUrl,
        }));

        const bookingEvent: CalendarEvent = {
          artistId: artist.artistId,
          artistName: artist.name,
          artistProfileImageUrl: artist.profileImageUrl,
          concertId: concert.concertId,
          date: format(new Date(concert.bookingSchedule), 'yyyy-MM-dd'),
          dateTime: concert.bookingSchedule,
          title: concert.title,
          place: '예매 일정',
          type: 'booking',
          bookingUrl: concert.bookingUrl,
          imageUrl: concert.imageUrl,
        };

        return [...performanceEvents, bookingEvent];
      })
    );
  }, [artists]);

  const filteredEvents = useMemo(() => {
    if (selectedArtistIds.length === 0) {
      return allCalendarEvents;
    }
    return allCalendarEvents.filter(event => selectedArtistIds.includes(event.artistId));
  }, [allCalendarEvents, selectedArtistIds]);

  const dailyEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter(event => isSameDay(new Date(event.date), selectedDate));
  }, [filteredEvents, selectedDate]);

  const handleArtistSelect = (artistId: number) => {
    setSelectedArtistIds(prevIds => 
      prevIds.includes(artistId) 
        ? prevIds.filter(id => id !== artistId)
        : [...prevIds, artistId]
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto">
        <ArtistCarousel
          artists={artists}
          selectedArtistIds={selectedArtistIds}
          onArtistSelect={handleArtistSelect}
        />
        <Calendar
          events={filteredEvents}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
        <div className="h-4 bg-muted/30" />
        <EventList events={dailyEvents} />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
