<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #f97316;
            margin-bottom: 10px;
        }
        .success-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .success-icon svg {
            width: 30px;
            height: 30px;
            color: white;
        }
        h1 {
            color: #1f2937;
            font-size: 24px;
            margin: 0 0 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .details-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        .detail-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            color: #6b7280;
            font-size: 14px;
            width: 140px;
            flex-shrink: 0;
        }
        .detail-value {
            color: #1f2937;
            font-size: 14px;
            font-weight: 500;
        }
        .meeting-link-section {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        .meeting-link-section h3 {
            color: white;
            margin: 0 0 12px;
            font-size: 18px;
        }
        .meeting-link-section p {
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 16px;
            font-size: 14px;
        }
        .meeting-button {
            display: inline-block;
            background-color: white;
            color: #2563eb;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .meeting-button:hover {
            transform: translateY(-2px);
        }
        .note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 0 8px 8px 0;
            margin: 24px 0;
        }
        .note p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #9ca3af;
            font-size: 12px;
            margin: 5px 0;
        }
        .footer a {
            color: #f97316;
            text-decoration: none;
        }
        .dashboard-link {
            display: inline-block;
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
            <div class="success-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: white;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h1>Booking Confirmed!</h1>
            <p class="subtitle">Your consultation has been confirmed by the designer</p>
        </div>

        <div class="details-card">
            <div class="detail-row">
                <span class="detail-label">Designer</span>
                <span class="detail-value">{{ $booking->designer->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->booking_date)->format('l, F j, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->booking_time)->format('g:i A') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Consultation Type</span>
                <span class="detail-value" style="text-transform: capitalize;">{{ $booking->consultation_type }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Project Type</span>
                <span class="detail-value">{{ $booking->project_type }}</span>
            </div>
        </div>

        @if($booking->consultation_type === 'online' && $booking->meeting_link)
        <div class="meeting-link-section">
            <h3>🎥 Join Your Online Meeting</h3>
            <p>Click the button below to join your consultation at the scheduled time</p>
            <a href="{{ $booking->meeting_link }}" class="meeting-button">Join Meeting</a>
        </div>
        @elseif($booking->consultation_type === 'in-person')
        <div class="note">
            <p><strong>In-Person Meeting:</strong> Please arrive at the designer's location at the scheduled time. Contact the designer if you need directions.</p>
        </div>
        @endif

        @if($booking->notes)
        <div class="note">
            <p><strong>Designer's Note:</strong> {{ $booking->notes }}</p>
        </div>
        @endif

        <div style="text-align: center;">
            <a href="{{ url('/my-bookings') }}" class="dashboard-link">View My Bookings</a>
        </div>

        <div class="footer">
            <p>Thank you for choosing {{ config('app.name') }}</p>
            <p>If you have any questions, please contact your designer directly.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
