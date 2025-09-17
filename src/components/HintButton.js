import React, { useState, useRef } from 'react';
import { Button, Popper, Paper, Typography, ClickAwayListener } from '@mui/material';
import { createPortal } from 'react-dom';

const HintButton = ({ 
  children, 
  hint, 
  className = '', 
  style = {}, 
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
  ...otherProps 
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleButtonClick = (event) => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      // Let the button handle its own click, but also handle hint toggle if Shift is pressed
      if (event.shiftKey) {
        event.preventDefault();
        handleToggle();
      }
    }
  };

  const hintContent = open && hint ? (
    createPortal(
      <Popper
        open={open}
        anchorEl={buttonRef.current}
        placement="top"
        style={{ zIndex: 1300 }}
        modifiers={[
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              boundary: 'viewport',
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 1, 
              maxWidth: 200, 
              fontSize: '0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white'
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {hint}
            </Typography>
          </Paper>
        </ClickAwayListener>
      </Popper>,
      document.body
    )
  ) : null;

  return (
    <>
      <Button
        ref={buttonRef}
        className={className}
        style={{
          position: 'relative',
          ...style
        }}
        disabled={disabled}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={open ? 'hint-popup' : undefined}
        {...otherProps}
      >
        {children}
        {hint && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
              }
            }}
            tabIndex="0"
            role="button"
            aria-label="Show hint"
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: '#666',
              fontSize: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1,
              border: '1px solid #ccc'
            }}
          >
            ?
          </span>
        )}
      </Button>
      {hintContent}
    </>
  );
};

export default HintButton;