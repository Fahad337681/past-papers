# 📚 Past Papers Library

A comprehensive web application for managing and accessing educational past papers with a modern, secure admin panel.

![Past Papers Library](https://img.shields.io/badge/Status-Live-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.18+-blue)

## 🌟 Features

### ✨ User Interface

- **Modern Design**: Beautiful purple-pink gradient with gold accents
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Smooth animations, hover effects, and glassmorphism
- **Statistics Dashboard**: Real-time stats for papers, subjects, years, and downloads
- **Quick Actions**: Recent, popular, newest papers, and bulk download
- **Advanced Search**: Filter by subject, year, and file type
- **Toast Notifications**: User-friendly feedback system
- **Keyboard Shortcuts**: Ctrl+K (search), Ctrl+A (select all), Escape (close)

### 🔐 Security & Authentication

- **Admin Login System**: Secure authentication with bcrypt password hashing
- **Session Management**: Server-side sessions with express-session
- **Protected Routes**: Admin panel and sensitive operations require login
- **Secure Logout**: Proper session destruction
- **Default Credentials**: admin / password (change in production)

### 📁 File Management

- **Drag & Drop Upload**: Easy file upload with visual feedback
- **File Validation**: Type and size restrictions
- **Download Tracking**: Track download counts per paper
- **Export Data**: Download papers data as JSON
- **File Organization**: Automatic categorization by subject and year

## 🚀 Live Demo

**Main Website**: [https://your-app-name.onrender.com](https://your-app-name.onrender.com)
**Admin Panel**: [https://your-app-name.onrender.com/admin](https://your-app-name.onrender.com/admin)

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Authentication**: bcryptjs, express-session
- **File Upload**: Multer
- **Styling**: Custom CSS with Flexbox, Grid, CSS Variables
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/past-papers-library.git
cd past-papers-library

# Install dependencies
npm install

# Start the development server
npm start

# Or use nodemon for development
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key-here
```

## 🌐 Deployment

### Render.com (Recommended)

1. Fork this repository
2. Go to [render.com](https://render.com) and create account
3. Click "New Web Service"
4. Connect your GitHub repository
5. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `SESSION_SECRET=your-secure-secret`
6. Deploy!

### Railway.app

1. Go to [railway.app](https://railway.app)
2. Start a new project
3. Deploy from GitHub
4. Select this repository
5. Deploy automatically!

### Heroku

1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Run: `git push heroku main`
4. Set environment variables in Heroku dashboard

## 📱 Usage

### For Students/Users

1. Visit the main website
2. Browse papers by subject or year
3. Use advanced search for specific papers
4. Download papers with one click
5. View statistics and popular papers

### For Administrators

1. Go to `/admin` or click "Admin Panel"
2. Login with credentials (admin / password)
3. Upload new papers with drag & drop
4. Manage existing papers
5. Export data or view download statistics
6. Logout securely

## 🔧 Configuration

### Changing Admin Credentials

1. Generate a new password hash:

```javascript
const bcrypt = require("bcryptjs");
const hash = bcrypt.hashSync("your-new-password", 10);
console.log(hash);
```

2. Update `ADMIN_PASSWORD` in `server.js`

### Customizing Styles

- Main styles: `public/styles.css`
- Admin styles: `public/admin.css`
- Login styles: `public/login.css`

### File Upload Settings

- Maximum file size: 10MB
- Allowed file types: PDF, DOC, DOCX, TXT
- Upload directory: `uploads/`

## 📊 API Endpoints

### Public Endpoints

- `GET /` - Main website
- `GET /api/papers` - Get all papers
- `GET /api/papers/:id/download` - Download paper
- `GET /api/auth/status` - Check authentication status

### Protected Endpoints (Admin Only)

- `GET /admin` - Admin panel
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `POST /logout` - Logout user
- `POST /api/upload` - Upload new paper
- `DELETE /api/papers/:id` - Delete paper

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Express.js community
- All contributors and users

## 📞 Support

If you have any questions or need help:

- Create an issue on GitHub
- Contact: your-email@example.com

---

⭐ **Star this repository if you find it helpful!**
