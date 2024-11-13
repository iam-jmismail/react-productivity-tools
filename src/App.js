import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const PomodoroTimer = () => {
  const defaultWorkTime = 25 * 60; // 25 minutes
  const defaultBreakTime = 5 * 60; // 5 minutes

  const [time, setTime] = useState(defaultWorkTime);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [workTime, setWorkTime] = useState(defaultWorkTime);
  const [breakTime, setBreakTime] = useState(defaultBreakTime);
  const [history, setHistory] = useState([]); // Track session history

  // Load history from localStorage when the component mounts
  useEffect(() => {
    const storedHistory = localStorage.getItem("pomodoroHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      clearInterval(interval);
      logSession(); // Log the completed session
      switchSession(); // Switch session between work and break
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const toggleStartPause = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(isWorkSession ? workTime : breakTime);
  };

  const switchSession = () => {
    setIsWorkSession((prevSession) => !prevSession);
    setTime(isWorkSession ? breakTime : workTime);
    setIsActive(false);
  };

  // Log session details to history when a session ends
  const logSession = () => {
    const sessionType = isWorkSession ? "Work" : "Break";
    const duration = isWorkSession ? workTime : breakTime;
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - duration * 1000);

    const newSession = {
      type: sessionType,
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      duration: formatTime(duration),
    };

    // Update history state and save to localStorage
    setHistory((prevHistory) => {
      const updatedHistory = [...prevHistory, newSession];
      localStorage.setItem("pomodoroHistory", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  // Function to clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("pomodoroHistory");
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h2" gutterBottom>
        {formatTime(time)}
      </Typography>
      <Typography
        variant="h6"
        gutterBottom
        color={isWorkSession ? "primary" : "secondary"}
      >
        {isWorkSession ? "Focus" : "Break"}
      </Typography>
      <Box display="flex" justifyContent="center" gap={2} mt={2}>
        <Button variant="contained" color="primary" onClick={toggleStartPause}>
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button variant="contained" color="secondary" onClick={resetTimer}>
          Reset
        </Button>
      </Box>
      <Box mt={4}>
        <FormControl variant="outlined" margin="dense">
          <InputLabel>Work Duration (min)</InputLabel>
          <Select
            value={workTime / 60}
            onChange={(e) => {
              const newWorkTime = e.target.value * 60;
              setWorkTime(newWorkTime);
              if (isWorkSession) setTime(newWorkTime);
            }}
            label="Work Duration (min)"
          >
            {[15, 25, 30, 45, 60].map((minutes) => (
              <MenuItem key={minutes} value={minutes}>
                {minutes} min
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" margin="dense" sx={{ ml: 2 }}>
          <InputLabel>Break Duration (min)</InputLabel>
          <Select
            value={breakTime / 60}
            onChange={(e) => {
              const newBreakTime = e.target.value * 60;
              setBreakTime(newBreakTime);
              if (!isWorkSession) setTime(newBreakTime);
            }}
            label="Break Duration (min)"
          >
            {[5, 10, 15].map((minutes) => (
              <MenuItem key={minutes} value={minutes}>
                {minutes} min
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* History Section */}
      <Box mt={6} textAlign="center">
        <Box>
          <Typography variant="h5" gutterBottom>
            Session History
          </Typography>
          <Button variant="outlined" color="error" onClick={clearHistory}>
            Clear History
          </Button>
          <List>
            {history.map((session, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`${session.type} Session`}
                    secondary={`Start: ${session.startTime} | End: ${session.endTime} | Duration: ${session.duration}`}
                  />
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default PomodoroTimer;
