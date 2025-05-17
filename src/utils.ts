import { 
  Observer, 
  Equator, 
  SiderealTime, 
  Body
} from 'astronomy-engine';
import './style.css';

// Calculate parallactic angle of the Moon
export function calculateParallacticAngle(date: Date, location: { lat: number, lon: number }): number {
    // Get equatorial coordinates of the Moon
    const observer = new Observer(location.lat, location.lon, 0);
    const equ = Equator(Body.Moon, date, observer, true, true);
    
    // Calculate hour angle in radians
    // Using correct implementation of SiderealTime - subtract RA to get hour angle
    const siderealTime = SiderealTime(date);
    const hourAngle = siderealTime - equ.ra;
    
    // Convert latitude and declination to radians
    const latRad = location.lat * Math.PI / 180;
    const decRad = equ.dec * Math.PI / 180;
    const haRad = hourAngle * 15 * Math.PI / 180; // 15 deg per hour
    
    // Calculate parallactic angle
    const numerator = Math.sin(haRad);
    const denominator = Math.tan(latRad) * Math.cos(decRad) - Math.sin(decRad) * Math.cos(haRad);
    
    // Calculate parallactic angle in degrees
    const parallacticAngle = Math.atan2(numerator, denominator) * 180 / Math.PI;
    
    return parallacticAngle;
  }
  