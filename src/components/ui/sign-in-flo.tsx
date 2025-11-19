"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Switch from "./star-wars-toggle-switch";

interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
  isDarkMode?: boolean;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword,
  isDarkMode = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative group">
      <div
        className={`relative overflow-hidden rounded-lg border transition-all duration-500 ease-in-out ${
          isDarkMode 
            ? 'border-zinc-700 bg-zinc-800' 
            : 'border-gray-300 bg-white'
        }`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-blue-400 ${
          isDarkMode ? 'text-zinc-400' : 'text-gray-500'
        }`}>
          {icon}
        </div>
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent pl-10 pr-12 py-3 focus:outline-none transition-colors duration-500 ${
            isDarkMode 
              ? 'text-white placeholder:text-zinc-500' 
              : 'text-gray-900 placeholder:text-gray-400'
          }`}
          placeholder=""
        />
        
        <label className={`absolute left-10 transition-all duration-200 ease-in-out pointer-events-none ${
          isFocused || value 
            ? 'top-2 text-xs text-blue-400 font-medium' 
            : isDarkMode
              ? 'top-1/2 -translate-y-1/2 text-sm text-zinc-400'
              : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
        }`}>
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              isDarkMode 
                ? 'text-zinc-400 hover:text-white' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {isHovering && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`
            }}
          />
        )}
      </div>
    </div>
  );
};

const SocialButton: React.FC<{ icon: React.ReactNode; name: string }> = ({ icon, name }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="relative group p-3 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-300 ease-in-out overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transition-transform duration-500 ${
        isHovered ? 'translate-x-0' : '-translate-x-full'
      }`} />
      <div className="relative text-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
    </button>
  );
};

const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

interface SignInFloProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  isSubmitting: boolean;
}

export const SignInFlo: React.FC<SignInFloProps> = ({ onSubmit, isSubmitting }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      email, 
      password
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${
      isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'
    }`}>
      {isDarkMode && <FloatingParticles />}
      
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-8 right-8 z-20">
        <Switch 
          checked={isDarkMode}
          onChange={setIsDarkMode}
        />
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-2xl transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-zinc-900/80 border border-zinc-800' 
            : 'bg-white/90 border border-gray-200'
        }`}>
          {/* Logo com círculo branco */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center relative mb-6">
              {/* Círculo branco estilizado atrás da logo */}
              <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-80 scale-110" />
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-full opacity-90" />
              
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="relative w-24 h-24 object-contain drop-shadow-lg"
              />
            </div>
            
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Bem-vindo
            </h1>
            <p className={`transition-colors duration-500 ${
              isDarkMode ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              Entre para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <AnimatedFormField
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              isDarkMode={isDarkMode}
            />

            <AnimatedFormField
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
              isDarkMode={isDarkMode}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300'
                  }`}
                />
                <span className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-zinc-400' : 'text-gray-600'
                }`}>Lembrar-me</span>
              </label>
              
              <button
                type="button"
                className={`text-sm hover:underline transition-colors duration-500 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full relative group bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                isDarkMode ? 'focus:ring-offset-zinc-900' : 'focus:ring-offset-gray-50'
              }`}
            >
              <span className={`transition-opacity duration-200 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                Entrar
              </span>
              
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
