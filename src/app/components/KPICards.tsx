import { TrendingUp, TrendingDown, DollarSign, Clock, Zap, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface KPI {
  id: string;
  label: string;
  value: string;
  change: number;
  icon: any;
  color: string;
  trend: 'up' | 'down';
}

const kpis: KPI[] = [
  {
    id: 'cost',
    label: 'Cost Saved',
    value: '₹47.2K',
    change: 12.5,
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    trend: 'up'
  },
  {
    id: 'delays',
    label: 'Delays Reduced',
    value: '34%',
    change: 8.3,
    icon: Clock,
    color: 'from-blue-500 to-cyan-600',
    trend: 'up'
  },
  {
    id: 'efficiency',
    label: 'Efficiency',
    value: '94.2%',
    change: 5.7,
    icon: Zap,
    color: 'from-purple-500 to-violet-600',
    trend: 'up'
  },
  {
    id: 'inventory',
    label: 'Inventory Accuracy',
    value: '98.8%',
    change: 2.1,
    icon: Package,
    color: 'from-orange-500 to-amber-600',
    trend: 'up'
  }
];





const AnimatedCounter = ({ value, delay = 0 }: { value: string; delay?: number }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const targetValue = value;
    const hasLetters = /[A-Z%]/.test(targetValue);
    const numericValue = parseFloat(targetValue.replace(/[^0-9.]/g, ''));
    const suffix = targetValue.replace(/[0-9.]/g, '');

    if (hasLetters) {
      // For values with letters (like %), just animate the appearance
      setDisplayValue(targetValue);
    } else {
      // Animate numeric values
      let currentValue = 0;
      const increment = numericValue / 30; // 30 steps for smooth animation
      const stepDuration = 50; // 50ms per step

      const counter = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
          currentValue = numericValue;
          clearInterval(counter);
        }
        
        if (suffix === 'K') {
          setDisplayValue(`₹${currentValue.toFixed(1)}K`);
        } else {
          setDisplayValue(currentValue.toFixed(1));
        }
      }, stepDuration);

      return () => clearInterval(counter);
    }
  }, [isVisible, value]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-white"
        >
          {displayValue}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function KPICards() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative group"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all overflow-hidden">
                {/* Gradient Orb */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${kpi.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`} />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color} shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      <span>{kpi.change}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <AnimatedCounter value={kpi.value} delay={idx * 0.1 + 0.3} />
                    <div className="text-sm text-slate-400">{kpi.label}</div>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      
      
      
          </div>
  );
}
