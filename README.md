# Wirespeed Security Operations Reports

[![Live Demo](https://img.shields.io/badge/Live-Demo-blueviolet?style=for-the-badge)](https://wirespeed-reports.northernlight.workers.dev/)

A modern, high-performance security report generator for Wirespeed Managed Detection & Response (MDR). This tool generates professional, print-ready A4 security operations reports directly from the Wirespeed API, optimized for clarity, speed, and executive-level presentation.

## 🚀 Features

- **Automated Intelligence**: Real-time data retrieval from the Wirespeed API for accurate security telemetry.
- **Modern Professional Design**: A clean, minimalist aesthetic with subtle gradients and high-end typography.
- **Precision Layout**: Pixel-perfect A4 document structure with automatic page breaking and consistent branding.
- **Comprehensive Analysis**:
    - **Executive Summary**: High-level posture overview and service coverage insights.
    - **Detection Pipeline**: Visual breakdown of the alert funnel and automation efficiency.
    - **Response Activity**: Categorized escalated cases sorted by severity and impact.
    - **Asset Intelligence**: Geographic login analysis and OS distribution tracking.
    - **Infrastructure Overview**: Detailed event ingestion metrics by source and volume.
- **Universal Export**: CSS-optimized for high-fidelity PDF generation and physical printing.

## 🛠 Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev) (Runes-native)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (Modern utility-first CSS)
- **Platform**: [Cloudflare Workers](https://workers.cloudflare.com/) (Edge-deployed for global speed)
- **Language**: TypeScript (Type-safe throughout)

## 🏁 Getting Started

### Prerequisites

- Node.js (v20 or later)
- A Wirespeed API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/WirespeedReports.git
   cd WirespeedReports
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`. You can use the sidebar to input your API key and preview reports with live data.

### Deployment

Configured for seamless deployment on Cloudflare Workers.

1. Authenticate with Wrangler:
   ```bash
   npx wrangler login
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## 📄 Usage

1. **Authentication**: Enter your Wirespeed API key in the configuration panel.
2. **Configuration**: Select your desired reporting period (Monthly, Quarterly, etc.).
3. **Generation**: Click "Generate Report" to aggregate data and render the preview.
4. **Export**: Use the "Print / Download" button. For the best PDF quality, ensure "Background Graphics" is enabled in your browser's print settings.

## 🏗 Project Structure

- `src/lib/server/wirespeed`: API client and data transformation logic.
- `src/lib/components/pages/home/layout`: Core document structure (Headers, Footers, Page wrappers).
- `src/lib/components/pages/home/reportPages`: Modular page implementations.
- `src/routes/api/report/generate`: Server-side data aggregation and sanitization.

---

Built with ❤️ by the Wirespeed community.
