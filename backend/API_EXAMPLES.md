# Eventful API Usage Examples

## Base URL

```
http://localhost:3000/api/v1
```

---

## 1. Authentication

### Register as Creator

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CREATOR"
  }'
```

### Register as Eventee

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "eventee@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "EVENTEE"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "creator@example.com",
    "password": "password123"
  }'
```

---

## 2. Event Management (Creator)

### Create Event

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Tech Conference 2026",
    "description": "Annual technology conference featuring industry leaders",
    "location": "Lagos Convention Center",
    "date": "2026-06-15T09:00:00Z",
    "price": 5000,
    "currency": "NGN",
    "imageUrl": "https://example.com/event-image.jpg",
    "capacity": 500,
    "status": "PUBLISHED",
    "isPublic": true
  }'
```

### Get My Events (Creator Only)

```bash
curl -X GET http://localhost:3000/api/v1/events/my/events \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Get Event Attendees (Creator Only)

```bash
curl -X GET http://localhost:3000/api/v1/events/{EVENT_ID}/attendees \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## 3. Event Discovery (Public)

### List All Events

```bash
curl -X GET http://localhost:3000/api/v1/events
```

### Get Event by ID

```bash
curl -X GET http://localhost:3000/api/v1/events/{EVENT_ID}
```

### Get Event by Slug (for sharing)

```bash
curl -X GET http://localhost:3000/api/v1/events/slug/tech-conference-2026-1738512345678
```

---

## 4. Ticket Purchase & Management

### Purchase Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets/purchase \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "eventId": "EVENT_ID_HERE",
    "ticketTypeId": "TICKET_TYPE_ID_HERE"
  }'
```

**Response includes QR code**:

```json
{
  "success": true,
  "ticket": {
    "id": "ticket-uuid",
    "qrCode": "event-user-uuid",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "status": "VALID",
    "purchasePrice": "5000",
    "event": { ... },
    "user": { ... }
  }
}
```

### Get My Tickets

```bash
curl -X GET http://localhost:3000/api/v1/tickets/my-tickets \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Get Specific Ticket with QR Code

```bash
curl -X GET http://localhost:3000/api/v1/tickets/{TICKET_ID} \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## 5. QR Code Validation (Creator Only)

### Validate Ticket at Event Entrance

```bash
curl -X POST http://localhost:3000/api/v1/tickets/validate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "qrCode": "event-user-uuid-from-ticket",
    "eventId": "EVENT_ID_HERE"
  }'
```

**Success Response**:

```json
{
  "success": true,
  "message": "Ticket valid and scanned",
  "ticket": {
    "id": "ticket-uuid",
    "status": "USED",
    "scannedAt": "2026-06-15T08:30:00Z",
    ...
  }
}
```

---

## 6. Event Sharing (Public)

### Get Open Graph Metadata for Social Sharing

```bash
curl -X GET http://localhost:3000/api/v1/share/events/tech-conference-2026-1738512345678/metadata
```

**Response**:

```json
{
  "success": true,
  "metadata": {
    "title": "Tech Conference 2026",
    "description": "Annual technology conference...",
    "image": "https://example.com/event-image.jpg",
    "url": "http://localhost:3000/events/tech-conference-2026-1738512345678",
    "ogTags": {
      "og:title": "Tech Conference 2026",
      "og:description": "Annual technology conference...",
      "og:image": "https://example.com/event-image.jpg",
      "og:url": "http://localhost:3000/events/tech-conference-2026-1738512345678",
      "og:type": "website",
      "og:site_name": "Eventful"
    },
    "twitterTags": {
      "twitter:card": "summary_large_image",
      "twitter:title": "Tech Conference 2026",
      "twitter:description": "Annual technology conference...",
      "twitter:image": "https://example.com/event-image.jpg"
    }
  }
}
```

### Get Shareable Link

```bash
curl -X GET http://localhost:3000/api/v1/share/events/{EVENT_ID}/link
```

---

## 7. Error Handling Examples

### Unauthorized Access (No Token)

```json
{
  "success": false,
  "message": "Unauthorized - no token provided"
}
```

### Forbidden (Wrong Role)

```json
{
  "success": false,
  "message": "Forbidden - requires one of the following roles: CREATOR, ADMIN"
}
```

### Invalid QR Code

```json
{
  "success": false,
  "error": "Invalid ticket"
}
```

### Used Ticket

```json
{
  "success": false,
  "error": "Ticket is USED"
}
```

---

## Complete User Flow Example

### 1. Creator Creates Event

```bash
# Login as creator
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c creator-cookies.txt \
  -d '{"email": "creator@example.com", "password": "password123"}'

# Create event
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -b creator-cookies.txt \
  -d '{
    "title": "Music Festival",
    "description": "Amazing music festival",
    "location": "Central Park",
    "date": "2026-07-20T18:00:00Z",
    "price": 2500,
    "status": "PUBLISHED"
  }'
```

### 2. Eventee Purchases Ticket

```bash
# Login as eventee
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c eventee-cookies.txt \
  -d '{"email": "eventee@example.com", "password": "password123"}'

# Purchase ticket (receive QR code)
curl -X POST http://localhost:3000/api/v1/tickets/purchase \
  -H "Content-Type: application/json" \
  -b eventee-cookies.txt \
  -d '{"eventId": "EVENT_ID", "ticketTypeId": null}'
```

### 3. Eventee Views Their Tickets

```bash
curl -X GET http://localhost:3000/api/v1/tickets/my-tickets \
  -b eventee-cookies.txt
```

### 4. Creator Validates Ticket at Event

```bash
# Scan QR code and validate
curl -X POST http://localhost:3000/api/v1/tickets/validate \
  -H "Content-Type: application/json" \
  -b creator-cookies.txt \
  -d '{
    "qrCode": "QR_CODE_FROM_TICKET",
    "eventId": "EVENT_ID"
  }'
```

### 5. Creator Views Event Attendees

```bash
curl -X GET http://localhost:3000/api/v1/events/EVENT_ID/attendees \
  -b creator-cookies.txt
```

### 6. Share Event on Social Media

```bash
# Get share metadata (no auth required)
curl -X GET http://localhost:3000/api/v1/share/events/music-festival-1738512345678/metadata
```

---

## Environment Setup

Ensure `.env` file has:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/eventfull-application"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
```

---

## Testing Tips

1. **Save Cookies**: Use `-c cookies.txt` to save authentication cookies
2. **Use Cookies**: Use `-b cookies.txt` to send saved cookies
3. **Pretty Print JSON**: Pipe to `| jq` for formatted output
4. **Check Server Logs**: Watch backend terminal for request/response details
5. **Test Role Authorization**: Try accessing creator endpoints as eventee (should fail)

---

## Next Steps

1. **Frontend Integration**: Use these endpoints in your React/Next.js frontend
2. **Payment Integration**: Add Paystack payment before ticket generation
3. **Email Notifications**: Send tickets with QR codes via email
4. **Mobile App**: QR code scanning for event entry
5. **Analytics**: Track event views, ticket sales, and attendance
