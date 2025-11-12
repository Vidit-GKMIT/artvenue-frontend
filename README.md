# ArtVenue

## Overview

**ArtVenue** is a web platform designed to bridge the gap between **artists** looking for stages to perform and **venue owners** searching for talent.  
In many cases, artists struggle to find fair-paying opportunities, while venues struggle to discover artists.  

ArtVenue solves this problem by allowing **artists to list their profiles** and **venue owners to list their venues and events**, bringing both parties together on a single platform.


### **User Registration**
- Users sign up with **name**, **email**, **password**, and **role** (Artist or Venue Owner).
- If the user selects **Artist**, additional details like **category** and **age** are required.
- If the user selects **Venue Owner**, no extra details are needed initially.

### **Venue Owner**
- A venue owner can:
  - List only **one venue** (for now).
  - Create **multiple events** for that venue.

### **Artist**
- Artists can:
  - View all **available events**.
  - **Opt in** for any event they are interested in.

## Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React.js (Vite) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Email Notifications** | Nodemailer |
| **Caching** | Redis |

## Features
Role-based signup (Artist / Venue Owner)  
Artists can list their profile with their information. 
Venue Owners can create and manage venues.  
Artists can view and opt-in to available events. 
Email notification system to alert owners about interested artists.  
