import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Video
} from 'lucide-react';
import { useState } from 'react';

interface Designer {
    id: number;
    name: string;
    email: string;
    specialty: string | null;
    bio: string | null;
    hourly_rate: number | null;
    experience_years: number | null;
    portfolio_url: string | null;
    avatar: string | null;
    work_start_time: string;
    work_end_time: string;
    slot_duration: number;
    working_days: number[];
}

interface Props {
    designer: Designer;
    bookedSlots: Record<string, string[]>;
}

// Generate time slots based on designer's working hours and slot duration
const generateTimeSlots = (startTime: string, endTime: string, slotDuration: number): string[] => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
        
        // Add slot duration
        currentMinute += slotDuration;
        while (currentMinute >= 60) {
            currentMinute -= 60;
            currentHour += 1;
        }
    }
    
    return slots;
};

const projectTypes = [
    'Interior Design Consultation',
    'Floor Plan Review',
    'Home Renovation Planning',
    'Furniture Selection',
    'Color & Material Selection',
    'Space Optimization',
    'Complete Home Design',
    'Other',
];

const durationOptions = [
    { value: 30, label: '30 minutes', price: 0.5 },
    { value: 60, label: '1 hour', price: 1 },
    { value: 90, label: '1.5 hours', price: 1.5 },
    { value: 120, label: '2 hours', price: 2 },
];

export default function BookDesignerPage({ designer, bookedSlots }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [calendarPage, setCalendarPage] = useState(0); // For pagination (0 = first 14 dates, 1 = next 14, etc.)
    const datesPerPage = 14;

    // Generate time slots based on designer's availability settings
    const timeSlots = generateTimeSlots(
        designer.work_start_time,
        designer.work_end_time,
        designer.slot_duration
    );

    const { data, setData, post, processing, errors } = useForm({
        designer_id: designer.id,
        booking_date: '',
        booking_time: '',
        consultation_type: 'online',
        project_type: '',
        description: '',
        duration_minutes: designer.slot_duration,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hire a Designer', href: '/designers' },
        { title: `Book ${designer.name}`, href: `/designers/${designer.id}` },
    ];

    // Generate next 30 days (only on designer's working days)
    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            // Only include days the designer works
            if (designer.working_days.includes(date.getDay())) {
                dates.push(date.toISOString().split('T')[0]);
            }
        }
        return dates;
    };

    const availableDates = getAvailableDates();
    const totalPages = Math.ceil(availableDates.length / datesPerPage);
    const visibleDates = availableDates.slice(calendarPage * datesPerPage, (calendarPage + 1) * datesPerPage);

    const getAvailableTimeSlots = (date: string) => {
        const bookedForDate = bookedSlots[date] || [];
        return timeSlots.filter(slot => !bookedForDate.includes(slot));
    };

    const getAvailableSlotsCount = (date: string) => {
        const bookedForDate = bookedSlots[date] || [];
        return timeSlots.length - bookedForDate.length;
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedTime('');
        setData('booking_date', date);
        setData('booking_time', '');
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setData('booking_time', time);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/designers/book');
    };

    const calculatePrice = () => {
        if (!designer.hourly_rate) return null;
        const duration = durationOptions.find(d => d.value === data.duration_minutes);
        return designer.hourly_rate * (duration?.price || 1);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Book ${designer.name}`} />

            <div className="mx-auto max-w-4xl space-y-8">
                {/* Back Button */}
                <Link
                    href="/designers"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Designers
                </Link>

                {/* Designer Card */}
                <div className="flex flex-col items-start gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
                        {designer.avatar ? (
                            <img
                                src={designer.avatar}
                                alt={designer.name}
                                className="h-full w-full rounded-2xl object-cover"
                            />
                        ) : (
                            designer.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {designer.name}
                        </h1>
                        {designer.specialty && (
                            <p className="mt-1 text-indigo-600 dark:text-indigo-400">
                                {designer.specialty}
                            </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                            {designer.experience_years && (
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4" />
                                    {designer.experience_years} years experience
                                </span>
                            )}
                            {designer.hourly_rate && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    Rs. {designer.hourly_rate}/hour
                                </span>
                            )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {designer.work_start_time.slice(0, 5)} - {designer.work_end_time.slice(0, 5)} ({designer.slot_duration} min slots)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-xs">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                                        .filter((_, i) => designer.working_days.includes(i))
                                        .join(', ')}
                                </span>
                            </span>
                        </div>
                        {designer.bio && (
                            <p className="mt-3 text-slate-600 dark:text-slate-400">
                                {designer.bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Consultation Type */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Consultation Type
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setData('consultation_type', 'online')}
                                className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                                    data.consultation_type === 'online'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                                }`}
                            >
                                <div className={`rounded-full p-3 ${
                                    data.consultation_type === 'online'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                    <Video className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-slate-900 dark:text-white">Online</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Video call consultation</div>
                                </div>
                                {data.consultation_type === 'online' && (
                                    <Check className="ml-auto h-5 w-5 text-indigo-500" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('consultation_type', 'in-person')}
                                className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                                    data.consultation_type === 'in-person'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                                }`}
                            >
                                <div className={`rounded-full p-3 ${
                                    data.consultation_type === 'in-person'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-slate-900 dark:text-white">In-Person</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Meet at designer's office</div>
                                </div>
                                {data.consultation_type === 'in-person' && (
                                    <Check className="ml-auto h-5 w-5 text-indigo-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Select Date
                            </h2>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Available</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Limited</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Fully Booked</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Month Header with Navigation */}
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setCalendarPage(p => Math.max(0, p - 1))}
                                disabled={calendarPage === 0}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="text-center">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {visibleDates.length > 0 && (
                                        <>
                                            {new Date(visibleDates[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            {new Date(visibleDates[0]).getMonth() !== new Date(visibleDates[visibleDates.length - 1]).getMonth() && (
                                                <> - {new Date(visibleDates[visibleDates.length - 1]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</>
                                            )}
                                        </>
                                    )}
                                </span>
                                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                                    ({calendarPage + 1}/{totalPages})
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCalendarPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={calendarPage >= totalPages - 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7">
                            {visibleDates.map((date) => {
                                const availableCount = getAvailableSlotsCount(date);
                                const isFullyBooked = availableCount === 0;
                                const isLimited = availableCount > 0 && availableCount <= 3;
                                
                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        onClick={() => !isFullyBooked && handleDateSelect(date)}
                                        disabled={isFullyBooked}
                                        className={`relative rounded-xl p-3 text-center transition-all ${
                                            selectedDate === date
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                : isFullyBooked
                                                    ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {/* Availability Indicator */}
                                        <div className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${
                                            selectedDate === date
                                                ? 'bg-white'
                                                : isFullyBooked
                                                    ? 'bg-red-500'
                                                    : isLimited
                                                        ? 'bg-amber-500'
                                                        : 'bg-green-500'
                                        }`}></div>
                                        
                                        <div className="text-xs font-medium opacity-75">
                                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="text-lg font-bold">
                                            {new Date(date).getDate()}
                                        </div>
                                        <div className={`text-xs ${
                                            selectedDate === date 
                                                ? 'text-indigo-100' 
                                                : isFullyBooked 
                                                    ? 'text-slate-400 dark:text-slate-600'
                                                    : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                        <div className={`mt-1 text-xs font-medium ${
                                            selectedDate === date
                                                ? 'text-indigo-100'
                                                : isFullyBooked
                                                    ? 'text-red-500 dark:text-red-400'
                                                    : isLimited
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {isFullyBooked ? 'Full' : `${availableCount} slots`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.booking_date && (
                            <p className="mt-2 text-sm text-red-600">{errors.booking_date}</p>
                        )}
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                                Select Time for {formatDate(selectedDate)}
                            </h2>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                {getAvailableTimeSlots(selectedDate).length === 0 ? (
                                    <p className="col-span-full text-center text-slate-500 dark:text-slate-400">
                                        No available slots for this date. Please select another date.
                                    </p>
                                ) : (
                                    getAvailableTimeSlots(selectedDate).map((time) => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => handleTimeSelect(time)}
                                            className={`rounded-xl px-4 py-3 font-medium transition-all ${
                                                selectedTime === time
                                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))
                                )}
                            </div>
                            {errors.booking_time && (
                                <p className="mt-2 text-sm text-red-600">{errors.booking_time}</p>
                            )}
                        </div>
                    )}

                    {/* Duration */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Duration
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-4">
                            {durationOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setData('duration_minutes', option.value)}
                                    className={`rounded-xl border-2 px-4 py-3 text-center transition-all ${
                                        data.duration_minutes === option.value
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className="font-semibold text-slate-900 dark:text-white">{option.label}</div>
                                    {designer.hourly_rate && (
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            Rs. {designer.hourly_rate * option.price}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Project Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Project Type
                                </label>
                                <select
                                    value={data.project_type}
                                    onChange={(e) => setData('project_type', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">Select project type</option>
                                    {projectTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                {errors.project_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.project_type}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Describe Your Project
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Tell us about your project, requirements, and what you hope to achieve..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Booking Summary
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Designer</span>
                                <span className="font-medium text-slate-900 dark:text-white">{designer.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Type</span>
                                <span className="font-medium text-slate-900 dark:text-white capitalize">{data.consultation_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Date</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {selectedDate ? formatDate(selectedDate) : 'Not selected'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Time</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {selectedTime || 'Not selected'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Duration</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {durationOptions.find(d => d.value === data.duration_minutes)?.label}
                                </span>
                            </div>
                            {calculatePrice() && (
                                <>
                                    <hr className="border-slate-200 dark:border-slate-700" />
                                    <div className="flex justify-between text-base">
                                        <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            Rs. {calculatePrice()}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processing || !selectedDate || !selectedTime || !data.project_type || !data.description}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Calendar className="h-5 w-5" />
                            {processing ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
