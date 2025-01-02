const express = require('express');
const User = require('../models/User');
const sendEmergencyEmail = require('../utils/sendEmergencyEmail');

const router = express.Router();

router.post('/simulate-heart-rate', async (req, res) => {
  const { userId, heartRate, oxygenLevel, bodyTemperature, sleepQuality, emotionalState, location } = req.body;

  try {
    const user = await User.findById(userId).populate('emergencyContact');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const emergencyContact = user.emergencyContact;
    if (!emergencyContact) {
      return res.status(400).json({ message: 'Emergency contact not set' });
    }

    if (heartRate > 120) {
      const emailSent = await sendEmergencyEmail(emergencyContact.email, {
        name: user.username,
        heartRate,
        oxygenLevel,
        bodyTemperature,
        sleepQuality,
        emotionalState,
        location,
      });

      if (emailSent) {
        return res.status(200).json({ message: 'Alert sent successfully!' });
      } else {
        return res.status(500).json({ message: 'Error sending the email' });
      }
    }

    res.status(200).json({ message: 'Data received, no critical conditions.' });
  } catch (error) {
    console.error('Error processing simulation:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
