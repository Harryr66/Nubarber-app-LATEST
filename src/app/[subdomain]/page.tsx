"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { collection, getDocs, query, where, doc, getDoc, Timestamp, addDoc, deleteDoc } from "firebase/firestore";
import { getUserDb } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/payments";
import { getDay, parse, format, addMinutes, isSameDay, differenceInMinutes } from 'date-fns';
import { cn } from "@/lib/utils";
import { sendBookingConfirmationEmail } from "@/lib/email";

// --- Data Types ---
interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  userId: string;
}

interface Availability {
    day: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
}

interface StaffMember {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  userId: string;
  availability?: Availability[];
}

interface TimeOff {
    id: string;
    staffId: string;
    staffName: string;
    startDate: Timestamp;
    endDate: Timestamp;
    reason: string;
}

interface BookingRecord {
    id: string;
    bookingTime: Timestamp;
    staffId: string;
}

interface ShopDetails {
    name: string;
    address: string;
    headline?: string;
    description?: string;
    stripeConnected?: boolean;
    logoUrl?: string;
    subdomain?: string;
}

const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SubdomainBarberPage() {
  const params = useParams();
  const { toast } = useToast();
  const subdomain = params.subdomain as string;
  
  // Debug logging
  console.log('SubdomainBarberPage loaded with params:', params);
  console.log('Subdomain value:', subdomain);

  // --- State Management ---
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingDensity, setBookingDensity] = useState<Record<string, number>>({});
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  
  const [booking, setBooking] = useState({
    service: null as Service | null,
    staff: null as StaffMember | null,
    date: new Date(),
    time: "",
    customerName: "",
    customerEmail: "",
  });

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchShopData = async () => {
      if (!subdomain) {
        console.log('No subdomain provided');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching shop data for subdomain:', subdomain);
        
        const defaultDb = getUserDb();
        if (!defaultDb) {
          console.error('Database connection failed');
          toast({ title: "Error", description: "Database connection failed.", variant: "destructive" });
          return;
        }

        // First, find the shop by subdomain
        const shopsRef = collection(defaultDb, "shops");
        const subdomainQuery = query(shopsRef, where("subdomain", "==", subdomain));
        console.log('Querying shops collection for subdomain:', subdomain);
        
        const subdomainSnapshot = await getDocs(subdomainQuery);
        console.log('Query result:', subdomainSnapshot.empty ? 'No shops found' : 'Shop found');
        
        if (subdomainSnapshot.empty) {
          console.log('No shop found for subdomain:', subdomain);
          toast({ title: "Shop Not Found", description: "This booking page doesn't exist.", variant: "destructive" });
          return;
        }

        const shopDoc = subdomainSnapshot.docs[0];
        const shopData = shopDoc.data() as ShopDetails;
        const userId = shopDoc.id;
        
        setShopDetails(shopData);

        // Fetch services, staff, etc. using the found userId
        await Promise.all([
          fetchServices(userId),
          fetchStaff(userId),
          fetchTimeOff(userId),
          fetchBookings(userId)
        ]);

      } catch (error) {
        console.error("Error fetching shop data:", error);
        toast({ title: "Error", description: "Failed to load shop information.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, [subdomain, toast]);

  const fetchServices = async (userId: string) => {
    try {
      const defaultDb = getUserDb();
      if (!defaultDb) return;
      
      const servicesRef = collection(defaultDb, "services");
      const servicesQuery = query(servicesRef, where("userId", "==", userId));
      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchStaff = async (userId: string) => {
    try {
      const defaultDb = getUserDb();
      if (!defaultDb) return;
      
      const staffRef = collection(defaultDb, "staff");
      const staffQuery = query(staffRef, where("userId", "==", userId));
      const staffSnapshot = await getDocs(staffQuery);
      const staffData = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StaffMember[];
      setStaff(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchTimeOff = async (userId: string) => {
    try {
      const defaultDb = getUserDb();
      if (!defaultDb) return;
      
      const timeOffRef = collection(defaultDb, "timeOff");
      const timeOffQuery = query(timeOffRef, where("shopOwnerId", "==", userId));
      const timeOffSnapshot = await getDocs(timeOffQuery);
      const timeOffData = timeOffSnapshot.docs.map(doc => {
        const data = doc.data();
        // Handle both old and new data structures for backward compatibility
        if (data.date && !data.startDate) {
          // Old structure - convert to new structure
          return {
            id: doc.id,
            staffId: data.staffId || '',
            staffName: data.staffName || 'Unknown Staff',
            startDate: data.date,
            endDate: data.date, // Use same date for both start and end
            reason: data.reason || 'Personal Time Off'
          } as TimeOff;
        } else if (data.startDate && data.endDate) {
          // New structure
          return { id: doc.id, ...data } as TimeOff;
        } else {
          // Invalid data structure - skip this record
          console.warn('Invalid time off record structure:', data);
          return null;
        }
      }).filter(Boolean) as TimeOff[];
      
      setTimeOff(timeOffData);
    } catch (error) {
      console.error("Error fetching time off:", error);
    }
  };

  const fetchBookings = async (userId: string) => {
    try {
      const defaultDb = getUserDb();
      if (!defaultDb) return;
      
      const bookingsRef = collection(defaultDb, "bookings");
      const bookingsQuery = query(bookingsRef, where("shopOwnerId", "==", userId));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BookingRecord[];
      setBookings(bookingsData);
      
      // Calculate booking density
      const density: Record<string, number> = {};
      bookingsData.forEach(booking => {
        const dateKey = format(booking.bookingTime.toDate(), 'yyyy-MM-dd');
        density[dateKey] = (density[dateKey] || 0) + 1;
      });
      setBookingDensity(density);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Rest of the component logic remains the same as the original barber page
  // ... (you can copy the remaining functions from the original file)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (!shopDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h1>
          <p className="text-gray-600">This booking page doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-4">
            {shopDetails.logoUrl && (
              <Avatar className="h-16 w-16">
                <AvatarImage src={shopDetails.logoUrl} alt={shopDetails.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {shopDetails.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">{shopDetails.name}</h1>
              {shopDetails.headline && (
                <p className="text-lg text-gray-600 mt-2">{shopDetails.headline}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Book Your Appointment</CardTitle>
            <CardDescription>
              {shopDetails.description || "Easy and fast booking, available 24/7."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">
              Welcome to {shopDetails.name}! Please select your service and preferred time.
            </p>
            {/* Add your booking form components here */}
            <p className="text-center text-sm text-gray-500">
              Booking functionality coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 