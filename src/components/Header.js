import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = ({ children }) => {
  return (
    <header style={{
      backgroundColor: 'var(--dark)',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid rgba(147, 51, 234, 0.2)'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <motion.h1 
          style={{ 
            margin: 0, 
            color: 'var(--white)',
            fontSize: '1.8rem',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #ffffff, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          RoomResQ
        </motion.h1>
      </Link>
      {children}
    </header>
  );
};

export default Header; 