# Wirespeed Security Operations Reports

A professional, high-performance report generation engine for Wirespeed Managed Detection & Response (MDR). This platform transforms complex security telemetry into executive-grade, print-ready A4 reports, providing clear insights into security posture and operational efficiency.

## 🌟 Key Features

### 🛡️ Automated Intelligence
Seamlessly integrates with the Wirespeed API to aggregate real-time data across your entire security stack, ensuring accurate and up-to-date reporting.

### 🎨 Professional Design & Branding
- **Executive Aesthetics**: Clean, minimalist design optimized for readability and professional presentation.
- **Service Provider Support**: Fully customizable branding for MSPs, including white-label logos and primary color synchronization.
- **Precision Layout**: Pixel-perfect A4 document structure with automatic page breaking and consistent typography.

### 📊 Comprehensive Insights
- **Executive Summary**: High-level overview of security posture and service coverage.
- **Detection Pipeline**: Visual breakdown of alert processing efficiency and automation impact.
- **Response Activity**: Categorized escalated cases with detailed severity and response tracking.
- **Asset Intelligence**: Geographic analysis of suspicious activities and endpoint distribution.
- **Infrastructure Overview**: Detailed event ingestion metrics by source and volume.

### 📥 Versatile Export Options
- **Bulk Export**: Generate multiple client reports simultaneously, delivered as a secure ZIP archive.
- **High-Fidelity PDF**: CSS-optimized rendering specifically designed for headless browser environments and physical printing.

## 🛠 Tech Stack

- **Frontend**: [Svelte 5](https://svelte.dev) (utilizing modern Runes-native state management)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (utility-first, high-performance styling)
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/) & [Browser Rendering](https://developers.cloudflare.com/browser-rendering/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (ensuring robust type safety across the stack)

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or later)
- A valid Wirespeed API Key

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
Launch the development environment:
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### Deployment
The project is optimized for deployment on Cloudflare's edge network.
1. Authenticate with Wrangler:
   ```bash
   npx wrangler login
   ```
2. Deploy to production:
   ```bash
   npm run deploy
   ```

## 📖 Usage

1. **Authentication**: Enter your Wirespeed API key in the configuration sidebar.
2. **Account Mode**: The system automatically detects if you are an Individual or Service Provider.
3. **Configuration**: 
    - Select your reporting period (Monthly, Quarterly, Yearly, or Custom).
    - Service Providers can select specific clients and customize branding colors.
4. **Generation**: Click "Generate Report" to build the live preview.
5. **Export**: 
    - Use "Print / Download" for individual PDF generation.
    - Use "Bulk Export" to generate and download reports for multiple clients at once.

## 🏗 Project Structure

- `src/lib/server/report`: Core data aggregation and report generation logic.
- `src/lib/server/wirespeed`: Wirespeed API client and specialized telemetry types.
- `src/lib/components/pages/home`: Svelte components for the report engine and modular page layouts.
- `src/routes/api`: Serverless endpoints for data fetching and headless PDF generation.

---

Built with precision for the Wirespeed security ecosystem by a Wirespeed fan!
