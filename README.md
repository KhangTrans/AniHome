# Animal Rescue Platform Frontend

This is a functional ReactJS frontend for the National Animal Rescue Platform.
It simulates 4 key interfaces using Mock Data.

## Prerequisites

- Node.js installed

## Getting Started

1. Navigate to the project directory:

   ```bash
   cd animal-rescue-platform
   ```

2. Install dependencies (if not already done):

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (usually `http://localhost:5173`).

## Project Structure

- **/admin**: Super Admin Dashboard (Charts, Reports, Global Inventory)
- **/shelter**: Shelter Admin Dashboard (Manage Animals, Calendar, Shop)
- **/volunteer**: Grid/Mobile view for Volunteers (Tasks, Daily Logs)
- **/**: Public Landing Page (Adopt a Pet, Success Stories)

## Technical Details

- **Framework**: ReactJS (Vite)
- **Routing**: React Router DOM
- **Charts**: Chart.js & React-Chartjs-2
- **Icons**: Lucide React
- **Styling**: Standard CSS with modern Variables (Glassmorphism inspired elements)

## Features Implemented

- **Super Admin**: 2-Column Layout, Pie/Bar Charts, Moderation Cards.
- **Shelter**: Dashboard with inventory and animal management.
- **Volunteer**: Mobile-first design simulation with bottom navigation.
- **User**: Search functionality and responsive grid layout.
