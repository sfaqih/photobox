import React, { useState } from "react";
import { useIdleTimer } from "react-idle-timer";

function useIdle({ onIdle, idleTime }) {
  const [isIdle, setIsIdle] = useState(null);

  //handles what happens when the user is idle
  const handleOnIdle = (event) => {
    
    setIsIdle(true); //set the state to true
    const currentTime = new Date();
    const formattedCurrentTime = currentTime.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });

    console.log("user is idle", event); //log the user is idle followed by the event
    console.log("Last Active time", getLastActiveTime()); // you the log the time the user was last active
    console.log("Current time", formattedCurrentTime); //gets the curent time maybe to see what
    
    onIdle(); //then call onIdle function
  };

  const displayMinutes = (milliseconds) => {
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);;
    return minutes;
  }

  const displaySeconds = (milliseconds) => {
    const sec = Math.floor((milliseconds / 1000) % 60);;
    return sec;
  }  

  const { getRemainingTime, getLastActiveTime, resume } = useIdleTimer({
    timeout: 1000 * 60 * idleTime,
    onIdle: handleOnIdle,
    debounce: 500,
    onAction: () => resume,
    onActive: () => console.log("Testt23")
  });

  const remainingFormatted = (remaining) => {
    var min = displayMinutes(remaining);
    var sec = displaySeconds(remaining);

    if(min < 10) min = `0${min}`;
    if(sec < 10) sec = `0${sec}`;

    return `${min}:${sec}`;
  }

  return {
    getRemainingTime,
    getLastActiveTime,
    isIdle,
    remainingFormatted
  };
}

export default useIdle;