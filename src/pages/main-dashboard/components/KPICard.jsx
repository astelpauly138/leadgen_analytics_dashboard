import { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ title, value, change, changeType, icon, sparklineData, color }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const prevValueRef = useRef(animatedValue);

  useEffect(() => {
    const start = Number(prevValueRef.current) || 0;
    const end = Number(value) || 0;

    if (start === end) {
      // nothing to animate
      prevValueRef.current = end;
      setAnimatedValue(end);
      return;
    }

    const duration = 500; // Reduced from 1000ms to 500ms for faster animation
    const steps = 30; // Reduced steps for smoother faster animation
    const stepTime = duration / steps;
    const delta = end - start;
    const increment = delta / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      const finished = (increment > 0 && current >= end) || (increment < 0 && current <= end);
      if (finished) {
        setAnimatedValue(end);
        prevValueRef.current = end;
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? 'text-success' : 'text-error';
  const changeIcon = isPositive ? 'TrendingUp' : 'TrendingDown';

  // Only process sparklineData if it exists
  const normalizedData = sparklineData && sparklineData.length > 0
    ? (() => {
        const maxSparkline = Math.max(...sparklineData);
        return sparklineData.map(val => (val / maxSparkline) * 100);
      })()
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-250 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="caption text-muted-foreground text-xs md:text-sm mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground data-text">
            {animatedValue?.toLocaleString()}
          </h3>
        </div>
        <div 
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon name={icon} size={20} color={color} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${changeColor}`}>
            <Icon name={changeIcon} size={14} />
            <span className="text-xs md:text-sm font-medium">{change}%</span>
          </div>
          <span className="caption text-muted-foreground text-xs">vs last week</span>
        </div>

        {normalizedData && (
          <div className="flex items-end gap-[2px] h-8">
            {normalizedData.map((height, index) => (
              <div
                key={index}
                className="w-1 rounded-t transition-all duration-250"
                style={{
                  height: `${height}%`,
                  backgroundColor: color,
                  opacity: 0.6 + (index / normalizedData.length) * 0.4
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;