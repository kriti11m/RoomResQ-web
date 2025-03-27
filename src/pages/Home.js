import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../firebase/auth';
import Header from '../components/Header';

function Home() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState(null); // 'student' or 'admin'

  // Add animation to feature items when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-item').forEach(item => {
      observer.observe(item);
    });

    return () => {
      document.querySelectorAll('.feature-item').forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);

  const handleSignIn = async (type) => {
    setIsLoading(true);
    setError('');
    try {
      const { user } = await signInWithGoogle();
      
      // Validate email based on login type
      if (type === 'student' && !user.email.endsWith('@vitstudent.ac.in')) {
        throw new Error('Please use your VIT student email (@vitstudent.ac.in)');
      }
      
      if (type === 'admin' && user.email !== 'kritim724@gmail.com') {
        throw new Error('Invalid admin email');
      }

      // Navigate based on login type
      if (type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <section className="welcome-section">
        {/* Add animated floating shapes */}
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        
        <h1 className="welcome-title">
          {'Welcome to RoomResQ'.split('').map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </h1>
        <div className="hero-description">
          <p>Your one-stop solution for efficient hostel maintenance management. Submit requests, track status, and get timely repairs - all in one place! Designed specifically for campus living, RoomResQ simplifies the entire maintenance process for students and staff. Experience a hassle-free living environment with quick resolutions to all your maintenance needs.</p>
        </div>
        <div className="cta-buttons">
          {!loginType ? (
            <>
              <motion.button 
                className="btn btn-primary"
                onClick={() => setLoginType('student')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Student Login
              </motion.button>
              <motion.button 
                className="btn btn-secondary"
                onClick={() => setLoginType('admin')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Admin Login
              </motion.button>
            </>
          ) : (
            <div className="login-options">
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                className="btn btn-primary"
                onClick={() => handleSignIn(loginType)}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <span className="button-content">
                    <div className="loading-spinner"></div>
                    Signing in...
                  </span>
                ) : (
                  `Sign in with Google ${loginType === 'student' ? '(VIT Student)' : '(Admin)'}`
                )}
              </motion.button>
              <motion.button
                className="btn btn-secondary"
                onClick={() => setLoginType(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
            </div>
          )}
        </div>
      </section>
      
      <section className="overview-section animated">
        <div className="overview-card">
          <h3>Easy Request Submission</h3>
          <p>Quickly submit maintenance requests for electrical, plumbing, cleaning, internet, laundry, and other services with our simple form.</p>
        </div>
        <div className="overview-card">
          <h3>Real-time Tracking</h3>
          <p>Monitor the status of your maintenance requests in real-time. Get updates at every stage from submission to completion.</p>
        </div>
        <div className="overview-card">
          <h3>Instant Notifications</h3>
          <p>Receive notifications when your maintenance requests are processed, assigned, and completed - keeping you informed every step of the way.</p>
        </div>
      </section>

      <section className="home-features">
        <h2>Why Choose RoomResQ?</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Fast Response</h3>
            <p>Our efficient system ensures your maintenance issues are addressed quickly</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">User Friendly</h3>
            <p>Intuitive interface designed for easy navigation and request submission</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Detailed Reports</h3>
            <p>Access comprehensive reports and history of all your maintenance requests</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure System</h3>
            <p>Your data is protected with our secure authentication system</p>
          </div>
        </div>
      </section>

      <div className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About RoomResQ</h4>
            <p>RoomResQ is a comprehensive hostel maintenance management system designed to streamline the request and fulfillment process for campus accommodation.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: support@roomresq.com</p>
            <p>Phone: +1 (123) 456-7890</p>
            <p>Address: Campus Maintenance Office, University Campus</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RoomResQ. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 