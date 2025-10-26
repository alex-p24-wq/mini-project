# E-Cardamom Connect Frontend

React + Vite frontend application for E-Cardamom Connect platform.

## 🚀 Deploy to Vercel (Quick Start)

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Backend API deployed and accessible

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository: `E-Cardamom_connect`
4. Configure project:
   ```
   Project Name: e-cardamom-connect
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-api.com/api
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   ```

6. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Runs on http://localhost:5173

### Build for Production
```bash
npm run build
```
Output: `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboards/   # Role-based dashboards
│   │   ├── modals/       # Modal dialogs
│   │   ├── notifications/# Toast & notifications
│   │   └── ui/           # Basic UI components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   ├── utils/            # Helper functions
│   ├── css/              # Stylesheets
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies & scripts
```

## 🔧 Environment Variables

Create `.env` file in frontend directory:

```env
# Required
VITE_API_URL=http://localhost:5000/api

# Optional (for production)
VITE_RAZORPAY_KEY_ID=your_key
VITE_GOOGLE_CLIENT_ID=your_client_id
```

**Note**: All environment variables must start with `VITE_` to be accessible in the app.

## 📦 Build Configuration

### Vite Config (`vite.config.js`)
- **Port**: 5173 (development)
- **Build output**: `dist/`
- **Code splitting**: Vendor and utils chunks
- **Proxy**: API requests proxied to backend in development

### Vercel Config (`vercel.json`)
- **Rewrites**: All routes → `/index.html` (SPA support)
- **Headers**: Security headers configured
- **Redirects**: HTTP → HTTPS

## 🌐 API Integration

### API Service (`src/services/api.js`)
Axios instance configured with:
- Base URL from `VITE_API_URL`
- JWT token authentication
- Request/response interceptors

Example:
```javascript
import api from './services/api';

// GET request
const products = await api.get('/products');

// POST request with auth
const response = await api.post('/farmer/products', data);
```

## 🎨 Styling

- **CSS Modules**: Component-level styles
- **Global Styles**: `src/index.css`, `src/App.css`
- **Theme**: `src/css/theme-modern.css`
- **Responsive**: Mobile-first approach

## 🔐 Authentication

- JWT tokens stored in localStorage
- Protected routes with `ProtectedRoute` component
- Auto-redirect to login on 401 errors
- Token refresh on expiry

## 📱 Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

```bash
npm run lint
```

## 🚀 Deployment Checklist

- [ ] Backend API deployed and accessible
- [ ] Environment variables configured in Vercel
- [ ] CORS enabled in backend for Vercel domain
- [ ] API endpoints tested
- [ ] Payment gateway keys updated (production)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Email templates updated with production URLs

## 📊 Performance

- **Lighthouse Score**: Aim for 90+
- **Bundle Size**: Optimized with code splitting
- **Caching**: Static assets cached by Vercel CDN
- **Lazy Loading**: Route-based code splitting

## 🐛 Troubleshooting

### Build Fails
- Check Node version (v16+)
- Clear `node_modules` and reinstall
- Check for missing dependencies

### API Connection Error
- Verify `VITE_API_URL` is set
- Check backend CORS configuration
- Ensure backend is accessible

### 404 on Page Refresh
- Verify `vercel.json` is present
- Check rewrites configuration

### Environment Variables Not Working
- Must start with `VITE_`
- Rebuild after adding new variables
- Check Vercel dashboard for correct values

## 📚 Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Vercel Documentation](https://vercel.com/docs)

## 🔗 Links

- **Production**: https://your-app.vercel.app
- **Repository**: https://github.com/alex-p24-wq/E-Cardamom_connect
- **Backend API**: https://your-backend-api.com

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Contact: your-email@example.com
