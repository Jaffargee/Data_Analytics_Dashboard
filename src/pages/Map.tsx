import NigeriaMap from '@/components/charts/NigeriaMap';
import { useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface StateData {
      id: string;
      name: string;
      capital: string;
      region:
            | 'North West'
            | 'North East'
            | 'North Central'
            | 'South West'
            | 'South East'
            | 'South South';
      population: number; // millions
      gdp: number; // billion USD
      securityIndex: number; // 0-100 (100 = most secure)
      resourceType: string;
      alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      lat: number;
      lng: number;
}

// ─── Mock Intelligence Data ───────────────────────────────────────────────────
const NIGERIA_STATES: Record<string, StateData> = {
      lagos: {
            id: 'lagos',
            name: 'Lagos',
            capital: 'Ikeja',
            region: 'South West',
            population: 15.4,
            gdp: 33.7,
            securityIndex: 62,
            resourceType: 'Finance / Tech',
            alertLevel: 'MEDIUM',
            lat: 6.5244,
            lng: 3.3792,
      },
      kano: {
            id: 'kano',
            name: 'Kano',
            capital: 'Kano',
            region: 'North West',
            population: 13.1,
            gdp: 8.1,
            securityIndex: 44,
            resourceType: 'Agriculture',
            alertLevel: 'HIGH',
            lat: 12.0022,
            lng: 8.592,
      },
      rivers: {
            id: 'rivers',
            name: 'Rivers',
            capital: 'Port Harcourt',
            region: 'South South',
            population: 7.3,
            gdp: 21.4,
            securityIndex: 38,
            resourceType: 'Crude Oil',
            alertLevel: 'HIGH',
            lat: 4.8156,
            lng: 7.0498,
      },
      kaduna: {
            id: 'kaduna',
            name: 'Kaduna',
            capital: 'Kaduna',
            region: 'North West',
            population: 8.2,
            gdp: 5.3,
            securityIndex: 31,
            resourceType: 'Agriculture / Mining',
            alertLevel: 'CRITICAL',
            lat: 10.5222,
            lng: 7.4383,
      },
      oyo: {
            id: 'oyo',
            name: 'Oyo',
            capital: 'Ibadan',
            region: 'South West',
            population: 7.8,
            gdp: 6.2,
            securityIndex: 68,
            resourceType: 'Agriculture',
            alertLevel: 'LOW',
            lat: 7.3775,
            lng: 3.947,
      },
      delta: {
            id: 'delta',
            name: 'Delta',
            capital: 'Asaba',
            region: 'South South',
            population: 5.7,
            gdp: 15.2,
            securityIndex: 42,
            resourceType: 'Crude Oil / Gas',
            alertLevel: 'HIGH',
            lat: 5.7,
            lng: 5.92,
      },
      anambra: {
            id: 'anambra',
            name: 'Anambra',
            capital: 'Awka',
            region: 'South East',
            population: 5.5,
            gdp: 4.8,
            securityIndex: 35,
            resourceType: 'Commerce / Industry',
            alertLevel: 'HIGH',
            lat: 6.2104,
            lng: 7.0685,
      },
      bauchi: {
            id: 'bauchi',
            name: 'Bauchi',
            capital: 'Bauchi',
            region: 'North East',
            population: 6.5,
            gdp: 3.1,
            securityIndex: 28,
            resourceType: 'Solid Minerals',
            alertLevel: 'CRITICAL',
            lat: 10.3158,
            lng: 9.8442,
      },
      borno: {
            id: 'borno',
            name: 'Borno',
            capital: 'Maiduguri',
            region: 'North East',
            population: 5.9,
            gdp: 2.8,
            securityIndex: 15,
            resourceType: 'Agriculture',
            alertLevel: 'CRITICAL',
            lat: 11.8333,
            lng: 13.15,
      },
      akwaibom: {
            id: 'akwaibom',
            name: 'Akwa Ibom',
            capital: 'Uyo',
            region: 'South South',
            population: 5.5,
            gdp: 14.1,
            securityIndex: 55,
            resourceType: 'Crude Oil',
            alertLevel: 'MEDIUM',
            lat: 5.0377,
            lng: 7.9128,
      },
      ogun: {
            id: 'ogun',
            name: 'Ogun',
            capital: 'Abeokuta',
            region: 'South West',
            population: 5.2,
            gdp: 7.1,
            securityIndex: 71,
            resourceType: 'Industry / Limestone',
            alertLevel: 'LOW',
            lat: 6.998,
            lng: 3.4737,
      },
      imo: {
            id: 'imo',
            name: 'Imo',
            capital: 'Owerri',
            region: 'South East',
            population: 5.4,
            gdp: 4.1,
            securityIndex: 33,
            resourceType: 'Oil / Agriculture',
            alertLevel: 'HIGH',
            lat: 5.482,
            lng: 7.035,
      },
      niger: {
            id: 'niger',
            name: 'Niger',
            capital: 'Minna',
            region: 'North Central',
            population: 5.6,
            gdp: 4.4,
            securityIndex: 47,
            resourceType: 'Hydro Power / Mining',
            alertLevel: 'MEDIUM',
            lat: 9.9131,
            lng: 5.5983,
      },
      benue: {
            id: 'benue',
            name: 'Benue',
            capital: 'Makurdi',
            region: 'North Central',
            population: 5.7,
            gdp: 3.8,
            securityIndex: 29,
            resourceType: 'Agriculture',
            alertLevel: 'CRITICAL',
            lat: 7.7222,
            lng: 8.5227,
      },
      kogi: {
            id: 'kogi',
            name: 'Kogi',
            capital: 'Lokoja',
            region: 'North Central',
            population: 4.4,
            gdp: 3.2,
            securityIndex: 41,
            resourceType: 'Coal / Iron Ore',
            alertLevel: 'HIGH',
            lat: 7.7986,
            lng: 6.7378,
      },
      sokoto: {
            id: 'sokoto',
            name: 'Sokoto',
            capital: 'Sokoto',
            region: 'North West',
            population: 4.9,
            gdp: 2.9,
            securityIndex: 36,
            resourceType: 'Agriculture / Gas',
            alertLevel: 'HIGH',
            lat: 13.0059,
            lng: 5.2476,
      },
      enugu: {
            id: 'enugu',
            name: 'Enugu',
            capital: 'Enugu',
            region: 'South East',
            population: 4.4,
            gdp: 3.9,
            securityIndex: 52,
            resourceType: 'Coal / Commerce',
            alertLevel: 'MEDIUM',
            lat: 6.4584,
            lng: 7.5464,
      },
      plateau: {
            id: 'plateau',
            name: 'Plateau',
            capital: 'Jos',
            region: 'North Central',
            population: 4.2,
            gdp: 3.5,
            securityIndex: 34,
            resourceType: 'Tin / Columbite',
            alertLevel: 'CRITICAL',
            lat: 9.2182,
            lng: 9.5179,
      },
      cross_river: {
            id: 'cross_river',
            name: 'Cross River',
            capital: 'Calabar',
            region: 'South South',
            population: 3.9,
            gdp: 3.6,
            securityIndex: 61,
            resourceType: 'Tourism / Forestry',
            alertLevel: 'LOW',
            lat: 5.8702,
            lng: 8.5988,
      },
      edo: {
            id: 'edo',
            name: 'Edo',
            capital: 'Benin City',
            region: 'South South',
            population: 4.7,
            gdp: 5.1,
            securityIndex: 53,
            resourceType: 'Rubber / Oil',
            alertLevel: 'MEDIUM',
            lat: 6.335,
            lng: 5.6037,
      },
      adamawa: {
            id: 'adamawa',
            name: 'Adamawa',
            capital: 'Yola',
            region: 'North East',
            population: 4.2,
            gdp: 2.7,
            securityIndex: 26,
            resourceType: 'Agriculture',
            alertLevel: 'CRITICAL',
            lat: 9.3265,
            lng: 12.3984,
      },
      zamfara: {
            id: 'zamfara',
            name: 'Zamfara',
            capital: 'Gusau',
            region: 'North West',
            population: 4.3,
            gdp: 2.4,
            securityIndex: 12,
            resourceType: 'Gold / Agriculture',
            alertLevel: 'CRITICAL',
            lat: 12.1222,
            lng: 6.66,
      },
      kwara: {
            id: 'kwara',
            name: 'Kwara',
            capital: 'Ilorin',
            region: 'North Central',
            population: 3.3,
            gdp: 3.1,
            securityIndex: 63,
            resourceType: 'Agriculture / Marble',
            alertLevel: 'LOW',
            lat: 8.4966,
            lng: 4.5421,
      },
      osun: {
            id: 'osun',
            name: 'Osun',
            capital: 'Osogbo',
            region: 'South West',
            population: 4.7,
            gdp: 3.2,
            securityIndex: 66,
            resourceType: 'Cocoa / Granite',
            alertLevel: 'LOW',
            lat: 7.5629,
            lng: 4.52,
      },
      ondo: {
            id: 'ondo',
            name: 'Ondo',
            capital: 'Akure',
            region: 'South West',
            population: 4.1,
            gdp: 5.8,
            securityIndex: 58,
            resourceType: 'Oil / Cocoa',
            alertLevel: 'MEDIUM',
            lat: 7.25,
            lng: 5.1958,
      },
      abia: {
            id: 'abia',
            name: 'Abia',
            capital: 'Umuahia',
            region: 'South East',
            population: 3.7,
            gdp: 3.4,
            securityIndex: 48,
            resourceType: 'Oil / Commerce',
            alertLevel: 'MEDIUM',
            lat: 5.4527,
            lng: 7.5248,
      },
      taraba: {
            id: 'taraba',
            name: 'Taraba',
            capital: 'Jalingo',
            region: 'North East',
            population: 3.1,
            gdp: 2.2,
            securityIndex: 31,
            resourceType: 'Agriculture',
            alertLevel: 'CRITICAL',
            lat: 7.8731,
            lng: 11.364,
      },
      kebbi: {
            id: 'kebbi',
            name: 'Kebbi',
            capital: 'Birnin Kebbi',
            region: 'North West',
            population: 4.4,
            gdp: 2.6,
            securityIndex: 39,
            resourceType: 'Agriculture / Fish',
            alertLevel: 'HIGH',
            lat: 11.45,
            lng: 4.199,
      },
      katsina: {
            id: 'katsina',
            name: 'Katsina',
            capital: 'Katsina',
            region: 'North West',
            population: 7.8,
            gdp: 3.4,
            securityIndex: 27,
            resourceType: 'Agriculture',
            alertLevel: 'CRITICAL',
            lat: 12.99,
            lng: 7.59,
      },
      jigawa: {
            id: 'jigawa',
            name: 'Jigawa',
            capital: 'Dutse',
            region: 'North West',
            population: 5.8,
            gdp: 2.8,
            securityIndex: 48,
            resourceType: 'Agriculture',
            alertLevel: 'MEDIUM',
            lat: 12.228,
            lng: 9.5616,
      },
      nasarawa: {
            id: 'nasarawa',
            name: 'Nasarawa',
            capital: 'Lafia',
            region: 'North Central',
            population: 2.5,
            gdp: 2.3,
            securityIndex: 37,
            resourceType: 'Solid Minerals',
            alertLevel: 'HIGH',
            lat: 8.5259,
            lng: 8.3195,
      },
      gombe: {
            id: 'gombe',
            name: 'Gombe',
            capital: 'Gombe',
            region: 'North East',
            population: 3.3,
            gdp: 2.1,
            securityIndex: 42,
            resourceType: 'Limestone / Gypsum',
            alertLevel: 'HIGH',
            lat: 10.2791,
            lng: 11.1673,
      },
      yobe: {
            id: 'yobe',
            name: 'Yobe',
            capital: 'Damaturu',
            region: 'North East',
            population: 3.3,
            gdp: 2.0,
            securityIndex: 19,
            resourceType: 'Agriculture',
            alertLevel: 'CRITICAL',
            lat: 12.2958,
            lng: 11.749,
      },
      ekiti: {
            id: 'ekiti',
            name: 'Ekiti',
            capital: 'Ado-Ekiti',
            region: 'South West',
            population: 3.3,
            gdp: 2.4,
            securityIndex: 64,
            resourceType: 'Agriculture / Granite',
            alertLevel: 'LOW',
            lat: 7.719,
            lng: 5.311,
      },
      ebonyi: {
            id: 'ebonyi',
            name: 'Ebonyi',
            capital: 'Abakaliki',
            region: 'South East',
            population: 3.1,
            gdp: 2.0,
            securityIndex: 44,
            resourceType: 'Salt / Lead / Zinc',
            alertLevel: 'MEDIUM',
            lat: 6.2649,
            lng: 8.0137,
      },
      bayelsa: {
            id: 'bayelsa',
            name: 'Bayelsa',
            capital: 'Yenagoa',
            region: 'South South',
            population: 2.3,
            gdp: 7.3,
            securityIndex: 33,
            resourceType: 'Crude Oil',
            alertLevel: 'HIGH',
            lat: 4.7719,
            lng: 6.0699,
      },
      fct: {
            id: 'fct',
            name: 'FCT Abuja',
            capital: 'Abuja',
            region: 'North Central',
            population: 3.6,
            gdp: 11.2,
            securityIndex: 74,
            resourceType: 'Government / Services',
            alertLevel: 'LOW',
            lat: 9.0765,
            lng: 7.3986,
      },
};

const ALERT_CONFIG = {
      LOW: {
            color: '#22c55e',
            glow: '#22c55e40',
            label: 'SECURE',
            ring: '2px solid #22c55e',
      },
      MEDIUM: {
            color: '#f59e0b',
            glow: '#f59e0b40',
            label: 'ADVISORY',
            ring: '2px solid #f59e0b',
      },
      HIGH: {
            color: '#ef4444',
            glow: '#ef444440',
            label: 'ELEVATED',
            ring: '2px solid #ef4444',
      },
      CRITICAL: {
            color: '#dc2626',
            glow: '#dc262660',
            label: 'CRITICAL',
            ring: '2px solid #dc2626',
      },
};

const REGION_COLORS = {
      'North West': '#b45309',
      'North East': '#92400e',
      'North Central': '#78350f',
      'South West': '#d97706',
      'South East': '#ca8a04',
      'South South': '#a16207',
};

// Simplified SVG paths for Nigeria states (approximate polygons from lat/lng bbox)
// We'll render as a dot-map / grid using scaled coordinates
// const STATE_POSITIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
//       // North West
//       sokoto:    { x: 8,  y: 2,  w: 8, h: 7 },
//       kebbi:     { x: 4,  y: 9,  w: 8, h: 7 },
//       zamfara:   { x: 16, y: 3,  w: 8, h: 8 },
//       katsina:   { x: 22, y: 2,  w: 10,h: 8 },
//       kano:      { x: 26, y: 10, w: 10,h: 8 },
//       jigawa:    { x: 34, y: 6,  w: 9, h: 8 },
//       // North East
//       borno:     { x: 44, y: 4,  w: 14,h: 13 },
//       yobe:      { x: 40, y: 14, w: 10,h: 7 },
//       gombe:     { x: 36, y: 18, w: 8, h: 6 },
//       adamawa:   { x: 44, y: 18, w: 10,h: 12 },
//       bauchi:    { x: 28, y: 16, w: 10,h: 8 },
//       taraba:    { x: 38, y: 26, w: 10,h: 11 },
//       // North Central
//       sokoto2:   { x: 0,  y: 0,  w: 0, h: 0 },
//       kebbi2:    { x: 0,  y: 0,  w: 0, h: 0 },
//       niger:     { x: 10, y: 16, w: 12,h: 10 },
//       kaduna:    { x: 20, y: 16, w: 10,h: 9 },
//       plateau:   { x: 28, y: 24, w: 9, h: 8 },
//       nasarawa:  { x: 22, y: 26, w: 9, h: 7 },
//       benue:     { x: 26, y: 32, w: 12,h: 8 },
//       kogi:      { x: 16, y: 30, w: 11,h: 8 },
//       kwara:     { x: 8,  y: 26, w: 10,h: 8 },
//       fct:       { x: 20, y: 23, w: 6, h: 5 },
//       // South West
//       oyo:       { x: 6,  y: 36, w: 11,h: 9 },
//       ogun:      { x: 4,  y: 44, w: 9, h: 7 },
//       lagos:     { x: 8,  y: 51, w: 8, h: 5 },
//       osun:      { x: 14, y: 36, w: 8, h: 7 },
//       ondo:      { x: 14, y: 42, w: 8, h: 8 },
//       ekiti:     { x: 18, y: 36, w: 6, h: 6 },
//       // South East
//       enugu:     { x: 28, y: 38, w: 7, h: 6 },
//       ebonyi:    { x: 32, y: 38, w: 6, h: 6 },
//       anambra:   { x: 24, y: 40, w: 7, h: 6 },
//       imo:       { x: 24, y: 46, w: 6, h: 5 },
//       abia:      { x: 28, y: 44, w: 6, h: 5 },
//       // South South
//       edo:       { x: 18, y: 40, w: 8, h: 7 },
//       delta:     { x: 18, y: 47, w: 8, h: 7 },
//       bayelsa:   { x: 20, y: 54, w: 7, h: 5 },
//       rivers:    { x: 26, y: 50, w: 8, h: 7 },
//       akwaibom:  { x: 32, y: 48, w: 7, h: 7 },
//       cross_river:{ x: 34, y: 40, w: 8, h: 9 },
// };

const STATE_POSITIONS: Record<
      string,
      { x: number; y: number; w: number; h: number }
> = {
      // =========================
      // CONFIG
      // Each cell spaced evenly
      // =========================

      // North West
      sokoto: { x: 0, y: 0, w: 8, h: 8 },
      kebbi: { x: 0, y: 10, w: 8, h: 8 },
      zamfara: { x: 10, y: 0, w: 8, h: 8 },
      katsina: { x: 20, y: 0, w: 8, h: 8 },
      kano: { x: 10, y: 10, w: 8, h: 8 },
      jigawa: { x: 30, y: 0, w: 8, h: 8 },

      // North East
      yobe: { x: 40, y: 0, w: 8, h: 8 },
      borno: { x: 50, y: 0, w: 8, h: 8 },
      bauchi: { x: 30, y: 10, w: 8, h: 8 },
      gombe: { x: 40, y: 10, w: 8, h: 8 },
      adamawa: { x: 50, y: 10, w: 8, h: 8 },
      taraba: { x: 50, y: 20, w: 8, h: 8 },

      // North Central
      niger: { x: 0, y: 20, w: 8, h: 8 },
      kaduna: { x: 20, y: 10, w: 8, h: 8 },
      plateau: { x: 30, y: 20, w: 8, h: 8 },
      nasarawa: { x: 20, y: 20, w: 8, h: 8 },
      benue: { x: 40, y: 20, w: 8, h: 8 },
      kogi: { x: 30, y: 30, w: 8, h: 8 },
      kwara: { x: 0, y: 30, w: 8, h: 8 },
      fct: { x: 10, y: 20, w: 8, h: 8 },

      // South West
      oyo: { x: 20, y: 30, w: 8, h: 8 },
      osun: { x: 10, y: 30, w: 8, h: 8 },
      ekiti: { x: 40, y: 30, w: 8, h: 8 },

      ogun: { x: 0, y: 40, w: 8, h: 8 },
      ondo: { x: 10, y: 40, w: 8, h: 8 },
      lagos: { x: 0, y: 50, w: 8, h: 8 },

      // South East
      anambra: { x: 30, y: 40, w: 8, h: 8 },
      enugu: { x: 40, y: 40, w: 8, h: 8 },
      ebonyi: { x: 50, y: 30, w: 8, h: 8 },

      imo: { x: 20, y: 50, w: 8, h: 8 },
      abia: { x: 30, y: 50, w: 8, h: 8 },

      // South South
      edo: { x: 20, y: 40, w: 8, h: 8 },
      delta: { x: 10, y: 50, w: 8, h: 8 },

      rivers: { x: 30, y: 60, w: 8, h: 8 },
      bayelsa: { x: 40, y: 50, w: 8, h: 8 },
      akwaibom: { x: 50, y: 50, w: 8, h: 8 },
      cross_river: { x: 50, y: 40, w: 8, h: 8 },
};

// ─── Scanline / grid overlay ─────────────────────────────────────────────────
const ScanlineOverlay = () => (
      <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
            style={{
                  backgroundImage:
                        'repeating-linear-gradient(0deg, #d4a017 0px, #d4a017 1px, transparent 1px, transparent 4px)',
            }}
      />
);

const RadarPing = ({
      x,
      y,
      color,
}: {
      x: number;
      y: number;
      color: string;
}) => (
      <div
            className="absolute"
            style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%,-50%)',
            }}
      >
            <div
                  className="w-2 h-2 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: color }}
            />
            <div
                  className="w-2 h-2 rounded-full absolute inset-0"
                  style={{ backgroundColor: color }}
            />
      </div>
);

// ─── State Cell ───────────────────────────────────────────────────────────────
const StateCell = ({
      stateKey,
      data,
      pos,
      isSelected,
      isHovered,
      onHover,
      onSelect,
}: {
      stateKey: string;
      data: StateData;
      pos: { x: number; y: number; w: number; h: number };
      isSelected: boolean;
      isHovered: boolean;
      onHover: (key: string | null) => void;
      onSelect: (key: string) => void;
}) => {
      const alert = ALERT_CONFIG[data.alertLevel];
      const regionColor = REGION_COLORS[data.region];
      const active = isSelected || isHovered;

      // Grid is 60 cols × 65 rows
      const left = `${(pos.x / 60) * 100}%`;
      const top = `${(pos.y / 65) * 100}%`;
      const width = `${(pos.w / 60) * 100}%`;
      const height = `${(pos.h / 65) * 100}%`;

      return (
            <div
                  className="absolute cursor-pointer transition-all duration-200"
                  style={{
                        left,
                        top,
                        width,
                        height,
                        border: `1px solid ${active ? alert.color : regionColor + '80'}`,
                        backgroundColor: active
                              ? regionColor + '60'
                              : regionColor + '25',
                        boxShadow: active
                              ? `0 0 14px ${alert.glow}, inset 0 0 8px ${regionColor}30`
                              : 'none',
                        borderRadius: '2px',
                        zIndex: active ? 20 : 1,
                  }}
                  onMouseEnter={() => onHover(stateKey)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(stateKey)}
            >
                  {/* Alert indicator corner */}
                  <div
                        className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{
                              backgroundColor: alert.color,
                              boxShadow: `0 0 4px ${alert.color}`,
                        }}
                  />
                  {/* State name — show if cell large enough */}
                  {pos.w >= 8 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                    className="text-[16px] font-bold tracking-widest text-center leading-tight px-0.5 select-none"
                                    style={{
                                          color: active
                                                ? '#fbbf24'
                                                : '#d4a017aa',
                                          textShadow: active
                                                ? '0 0 6px #d4a01780'
                                                : 'none',
                                    }}
                              >
                                    {data.name.toUpperCase()}
                              </span>
                        </div>
                  )}
                  {/* GDP bar at bottom */}
                  <div
                        className="absolute bottom-0 left-0 h-[2px]"
                        style={{
                              width: `${Math.min((data.gdp / 35) * 100, 100)}%`,
                              backgroundColor: alert.color + 'cc',
                        }}
                  />
            </div>
      );
};

// ─── Stat Row ─────────────────────────────────────────────────────────────────
const StatRow = ({
      label,
      value,
      max,
      color,
}: {
      label: string;
      value: number | string;
      max?: number;
      color?: string;
}) => (
      <div className="mb-2">
            <div className="flex justify-between items-center mb-0.5">
                  <span
                        className="text-[10px] tracking-widest uppercase"
                        style={{ color: '#d4a01799' }}
                  >
                        {label}
                  </span>
                  <span
                        className="text-[11px] font-bold font-mono"
                        style={{ color: color || '#fbbf24' }}
                  >
                        {value}
                  </span>
            </div>
            {max !== undefined && (
                  <div className="h-[2px] bg-yellow-900/30 rounded-full overflow-hidden">
                        <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                    width: `${(Number(value) / max) * 100}%`,
                                    backgroundColor: color || '#d4a017',
                                    boxShadow: `0 0 6px ${color || '#d4a017'}`,
                              }}
                        />
                  </div>
            )}
      </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NigeriaIntelMap() {
      const [hoveredState, setHoveredState] = useState<string | null>(null);
      const [selectedState, setSelectedState] = useState<string>('lagos');
      const [time, setTime] = useState(new Date());
      const [filter, setFilter] = useState<
            'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      >('ALL');
      const [metric, setMetric] = useState<'security' | 'gdp' | 'population'>(
            'security'
      );
      const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

      useEffect(() => {
            tickRef.current = setInterval(() => setTime(new Date()), 1000);
            return () => {
                  if (tickRef.current) clearInterval(tickRef.current);
            };
      }, []);

      const activeState = hoveredState
            ? NIGERIA_STATES[hoveredState]
            : NIGERIA_STATES[selectedState];

      // Aggregated stats
      const allStates = Object.values(NIGERIA_STATES);
      const criticalCount = allStates.filter(
            (s) => s.alertLevel === 'CRITICAL'
      ).length;
      const highCount = allStates.filter((s) => s.alertLevel === 'HIGH').length;
      const totalPop = allStates.reduce((a, s) => a + s.population, 0);
      const totalGdp = allStates.reduce((a, s) => a + s.gdp, 0);
      const avgSecurity = Math.round(
            allStates.reduce((a, s) => a + s.securityIndex, 0) /
                  allStates.length
      );

      const filteredKeys = Object.keys(STATE_POSITIONS).filter((k) => {
            if (!NIGERIA_STATES[k]) return false;
            if (filter === 'ALL') return true;
            return NIGERIA_STATES[k].alertLevel === filter;
      });

      const handleHover = useCallback(
            (key: string | null) => setHoveredState(key),
            []
      );
      const handleSelect = useCallback(
            (key: string) => setSelectedState(key),
            []
      );

      const regionBreakdown = Object.entries(REGION_COLORS).map(([region]) => {
            const states = allStates.filter((s) => s.region === region);
            return {
                  region,
                  count: states.length,
                  avgSec: Math.round(
                        states.reduce((a, s) => a + s.securityIndex, 0) /
                              states.length
                  ),
            };
      });

      return (
            <div
                  className="min-h-screen w-full flex flex-col"
                  style={{
                        backgroundColor: '#0a0802',
                        fontFamily: "'Courier New', Courier, monospace",
                        color: '#d4a017',
                  }}
            >
                  {/* ── Header ── */}
                  <div
                        className="flex items-center justify-between px-6 py-3 border-b"
                        style={{
                              borderColor: '#d4a01720',
                              background:
                                    'linear-gradient(180deg, #0f0c03 0%, #0a0802 100%)',
                        }}
                  >
                        <div className="flex items-center gap-4">
                              {/* Simple Intel Logo */}
                              <div className="relative w-8 h-8">
                                    <div
                                          className="absolute inset-0 border-2 rotate-45 animate-spin"
                                          style={{
                                                borderColor: '#d4a017',
                                                animationDuration: '8s',
                                          }}
                                    />
                                    <div
                                          className="absolute inset-1 border rotate-12"
                                          style={{ borderColor: '#d4a01780' }}
                                    />
                                    <div className="absolute inset-2 bg-yellow-600 rounded-sm" />
                              </div>
                              {/* Intel Title */}
                              <div>
                                    <div
                                          className="text-[11px] tracking-[0.4em] uppercase"
                                          style={{ color: '#d4a01799' }}
                                    >
                                          Operation Center
                                    </div>
                                    <div
                                          className="text-base font-bold tracking-[0.2em] uppercase"
                                          style={{
                                                color: '#fbbf24',
                                                textShadow:
                                                      '0 0 12px #d4a01760',
                                          }}
                                    >
                                          NIGERIA INTELLIGENCE GRID
                                    </div>
                              </div>
                        </div>

                        {/* Right Navs */}
                        <div className="flex items-center gap-6">
                              {/* Alert filter */}
                              <div className="flex gap-1">
                                    {(
                                          [
                                                'ALL',
                                                'LOW',
                                                'MEDIUM',
                                                'HIGH',
                                                'CRITICAL',
                                          ] as const
                                    ).map((lvl) => (
                                          <button
                                                key={lvl}
                                                onClick={() => setFilter(lvl)}
                                                className="px-2 py-0.5 text-[9px] tracking-widest border transition-all"
                                                style={{
                                                      borderColor:
                                                            filter === lvl
                                                                  ? ALERT_CONFIG[
                                                                          lvl ===
                                                                          'ALL'
                                                                                ? 'LOW'
                                                                                : lvl
                                                                    ].color
                                                                  : '#d4a01730',
                                                      backgroundColor:
                                                            filter === lvl
                                                                  ? '#d4a01715'
                                                                  : 'transparent',
                                                      color:
                                                            filter === lvl
                                                                  ? '#fbbf24'
                                                                  : '#d4a01766',
                                                }}
                                          >
                                                {lvl}
                                          </button>
                                    ))}
                              </div>
                              <div className="text-right">
                                    <div
                                          className="text-[10px] tracking-widest"
                                          style={{ color: '#d4a01766' }}
                                    >
                                          LOCAL TIME
                                    </div>
                                    <div
                                          className="text-sm font-bold font-mono"
                                          style={{ color: '#fbbf24' }}
                                    >
                                          {time.toLocaleTimeString('en-NG', {
                                                hour12: false,
                                          })}{' '}
                                          WAT
                                    </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                    <div
                                          className="w-2 h-2 rounded-full animate-pulse bg-green-500"
                                          style={{
                                                boxShadow: '0 0 6px #22c55e',
                                          }}
                                    />
                                    <span className="text-[10px] tracking-widest text-green-400">
                                          LIVE
                                    </span>
                              </div>
                        </div>
                  </div>

                  <div className="flex flex-1 overflow-hidden">
                        {/* ── Left Panel: National Overview ── */}
                        <div
                              className="w-52 flex-shrink-0 flex flex-col border-r p-4 gap-4 overflow-y-auto"
                              style={{
                                    borderColor: '#d4a01720',
                                    background: '#0a080280',
                              }}
                        >
                              <div>
                                    <div
                                          className="text-[9px] tracking-[0.3em] uppercase mb-3"
                                          style={{ color: '#d4a01766' }}
                                    >
                                          NATIONAL OVERVIEW
                                    </div>
                                    <StatRow
                                          label="Avg Security"
                                          value={avgSecurity}
                                          max={100}
                                          color={
                                                avgSecurity > 50
                                                      ? '#22c55e'
                                                      : '#ef4444'
                                          }
                                    />
                                    <StatRow
                                          label="Total Population"
                                          value={`${totalPop.toFixed(0)}M`}
                                    />
                                    <StatRow
                                          label="Total GDP"
                                          value={`$${totalGdp.toFixed(0)}B`}
                                    />
                                    <StatRow
                                          label="Total States"
                                          value={allStates.length}
                                    />
                              </div>
                              <div
                                    className="border-t pt-3"
                                    style={{ borderColor: '#d4a01720' }}
                              >
                                    <div
                                          className="text-[9px] tracking-[0.3em] uppercase mb-2"
                                          style={{ color: '#d4a01766' }}
                                    >
                                          ALERT BREAKDOWN
                                    </div>
                                    {(
                                          [
                                                'CRITICAL',
                                                'HIGH',
                                                'MEDIUM',
                                                'LOW',
                                          ] as const
                                    ).map((lvl) => {
                                          const count = allStates.filter(
                                                (s) => s.alertLevel === lvl
                                          ).length;
                                          return (
                                                <div
                                                      key={lvl}
                                                      className="flex items-center justify-between mb-1.5"
                                                >
                                                      <div className="flex items-center gap-1.5">
                                                            <div
                                                                  className="w-1.5 h-1.5 rounded-full"
                                                                  style={{
                                                                        backgroundColor:
                                                                              ALERT_CONFIG[
                                                                                    lvl
                                                                              ]
                                                                                    .color,
                                                                        boxShadow: `0 0 4px ${ALERT_CONFIG[lvl].color}`,
                                                                  }}
                                                            />
                                                            <span
                                                                  className="text-[9px] tracking-widest"
                                                                  style={{
                                                                        color: '#d4a01788',
                                                                  }}
                                                            >
                                                                  {lvl}
                                                            </span>
                                                      </div>
                                                      <span
                                                            className="text-[10px] font-bold font-mono"
                                                            style={{
                                                                  color: ALERT_CONFIG[
                                                                        lvl
                                                                  ].color,
                                                            }}
                                                      >
                                                            {count}
                                                      </span>
                                                </div>
                                          );
                                    })}
                              </div>
                              <div
                                    className="border-t pt-3"
                                    style={{ borderColor: '#d4a01720' }}
                              >
                                    <div
                                          className="text-[9px] tracking-[0.3em] uppercase mb-2"
                                          style={{ color: '#d4a01766' }}
                                    >
                                          REGIONAL SECURITY
                                    </div>
                                    {regionBreakdown.map(
                                          ({ region, count, avgSec }) => (
                                                <div
                                                      key={region}
                                                      className="mb-2"
                                                >
                                                      <div className="flex justify-between mb-0.5">
                                                            <span
                                                                  className="text-[8px] tracking-wider truncate"
                                                                  style={{
                                                                        color: '#d4a01788',
                                                                        maxWidth: '70%',
                                                                  }}
                                                            >
                                                                  {region}
                                                            </span>
                                                            <span
                                                                  className="text-[8px] font-mono"
                                                                  style={{
                                                                        color:
                                                                              avgSec >
                                                                              50
                                                                                    ? '#22c55e'
                                                                                    : '#ef4444',
                                                                  }}
                                                            >
                                                                  {avgSec}
                                                            </span>
                                                      </div>
                                                      <div
                                                            className="h-[2px] rounded-full"
                                                            style={{
                                                                  backgroundColor:
                                                                        '#d4a01720',
                                                            }}
                                                      >
                                                            <div
                                                                  className="h-full rounded-full"
                                                                  style={{
                                                                        width: `${avgSec}%`,
                                                                        backgroundColor:
                                                                              REGION_COLORS[
                                                                                    region as keyof typeof REGION_COLORS
                                                                              ],
                                                                  }}
                                                            />
                                                      </div>
                                                </div>
                                          )
                                    )}
                              </div>
                              {/* Metric toggle */}
                              <div
                                    className="border-t pt-3"
                                    style={{ borderColor: '#d4a01720' }}
                              >
                                    <div
                                          className="text-[9px] tracking-[0.3em] uppercase mb-2"
                                          style={{ color: '#d4a01766' }}
                                    >
                                          MAP OVERLAY
                                    </div>
                                    {(
                                          [
                                                'security',
                                                'gdp',
                                                'population',
                                          ] as const
                                    ).map((m) => (
                                          <button
                                                key={m}
                                                onClick={() => setMetric(m)}
                                                className="w-full text-left px-2 py-1 mb-1 text-[9px] tracking-widest uppercase border transition-all"
                                                style={{
                                                      borderColor:
                                                            metric === m
                                                                  ? '#d4a017'
                                                                  : '#d4a01730',
                                                      color:
                                                            metric === m
                                                                  ? '#fbbf24'
                                                                  : '#d4a01766',
                                                      backgroundColor:
                                                            metric === m
                                                                  ? '#d4a01712'
                                                                  : 'transparent',
                                                }}
                                          >
                                                {m === 'security'
                                                      ? '🔴 Security Index'
                                                      : m === 'gdp'
                                                        ? '💰 GDP Output'
                                                        : '👥 Population'}
                                          </button>
                                    ))}
                              </div>
                        </div>

                        {/* ── Map Area ── */}
                        <div
                              className="flex-1 relative overflow-hidden"
                              style={{
                                    background:
                                          'radial-gradient(ellipse at 50% 40%, #0f0c03 0%, #070602 100%)',
                              }}
                        >
                              <NigeriaMap />
                              <ScanlineOverlay />
                              {/* Grid background */}
                              {/* <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: `linear-gradient(#d4a017 1px, transparent 1px), linear-gradient(90deg, #d4a017 1px, transparent 1px)`,
                                    backgroundSize: "5% 5%",
                              }} /> */}
                              {/* Compass */}
                              {/* <div className="absolute top-4 right-4 z-20 opacity-60">
                                    <div className="relative w-12 h-12">
                                          <div className="absolute inset-0 border rounded-full" style={{ borderColor: "#d4a017" }} />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-[8px] tracking-widest font-bold" style={{ color: "#fbbf24" }}>N</div>
                                          </div>
                                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-px h-4" style={{ backgroundColor: "#ef4444" }} />
                                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-px h-4" style={{ backgroundColor: "#d4a01780" }} />
                                          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-px" style={{ backgroundColor: "#d4a01780" }} />
                                          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-px" style={{ backgroundColor: "#d4a01780" }} />
                                    </div>
                              </div> */}
                              {/* Map title */}
                              {/* <div className="absolute top-4 left-4 z-20 flex gap-4">
                                    <div className="text-[8px] tracking-[0.4em]" style={{ color: "#d4a01766" }}>FEDERAL REPUBLIC OF</div>
                                    <div className="text-sm font-bold tracking-[0.3em]" style={{ color: "#fbbf24", textShadow: "0 0 10px #d4a01740" }}>NIGERIA</div>
                                    <div className="text-[12px] tracking-widest" style={{ color: "#d4a01744" }}>36 STATES + FCT</div>
                              </div> */}
                              {/* Scale bar */}
                              {/* <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                                    <div className="flex">
                                          <div className="w-8 h-1.5" style={{ backgroundColor: "#d4a017" }} />
                                          <div className="w-8 h-1.5" style={{ backgroundColor: "#0a0802" }} />
                                          <div className="w-8 h-1.5" style={{ backgroundColor: "#d4a017" }} />
                                    </div>
                                    <span className="text-[12px] tracking-widest" style={{ color: "#d4a01766" }}>≈ 500km</span>
                              </div> */}
                              {/* State cells */}
                              {/* <div className="absolute inset-8 top-14 bottom-10">
                                    {Object.entries(STATE_POSITIONS).map(([key, pos]) => {
                                          if (!NIGERIA_STATES[key] || pos.w === 0) return null;
                                          if (filter !== "ALL" && NIGERIA_STATES[key].alertLevel !== filter) return null;
                                          return (
                                                <StateCell key={key} stateKey={key} data={NIGERIA_STATES[key]} pos={pos}
                                                      isSelected={selectedState === key} isHovered={hoveredState === key}
                                                      onHover={handleHover} onSelect={handleSelect} />
                                          );
                                    })}
                              </div> */}
                              {/* Floating tooltip on hover */}
                              {/* {hoveredState && NIGERIA_STATES[hoveredState] && (() => {
                                    const pos = STATE_POSITIONS[hoveredState];
                                    const d = NIGERIA_STATES[hoveredState];
                                    const alert = ALERT_CONFIG[d.alertLevel];
                                    const tipLeft = pos.x > 30 ? "auto" : `${(pos.x / 60) * 100 + (pos.w / 60) * 100}%`;
                                    const tipRight = pos.x > 30 ? `${(1 - (pos.x + pos.w) / 60) * 100 + 2}%` : "auto";
                                    const tipTop = `${Math.min((pos.y / 65) * 100, 55)}%`;
                                    return (
                                          <div className="absolute z-50 pointer-events-none p-3 border text-[10px]"
                                                style={{
                                                      left: tipLeft === "auto" ? undefined : tipLeft,
                                                      right: tipRight === "auto" ? undefined : tipRight,
                                                      top: tipTop,
                                                      borderColor: alert.color,
                                                      backgroundColor: "#0a080299",
                                                      backdropFilter: "blur(8px)",
                                                      boxShadow: `0 0 16px ${alert.glow}`,
                                                      minWidth: "140px",
                                                }}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: alert.color }} />
                                                      <span className="font-bold tracking-wider" style={{ color: alert.color }}>{alert.label}</span>
                                                </div>
                                                <div className="font-bold text-sm mb-1" style={{ color: "#fbbf24" }}>{d.name}</div>
                                                <div className="text-[9px] mb-2" style={{ color: "#d4a01788" }}>{d.region}</div>
                                                <div className="space-y-1">
                                                      <div className="flex justify-between"><span style={{ color: "#d4a01788" }}>Capital</span><span style={{ color: "#fbbf24" }}>{d.capital}</span></div>
                                                      <div className="flex justify-between"><span style={{ color: "#d4a01788" }}>Pop.</span><span style={{ color: "#fbbf24" }}>{d.population}M</span></div>
                                                      <div className="flex justify-between"><span style={{ color: "#d4a01788" }}>GDP</span><span style={{ color: "#fbbf24" }}>${d.gdp}B</span></div>
                                                      <div className="flex justify-between"><span style={{ color: "#d4a01788" }}>Security</span><span style={{ color: d.securityIndex > 50 ? "#22c55e" : "#ef4444" }}>{d.securityIndex}/100</span></div>
                                                      <div className="flex justify-between"><span style={{ color: "#d4a01788" }}>Resource</span><span className="text-right" style={{ color: "#fbbf24", maxWidth: "80px", fontSize: "8px" }}>{d.resourceType}</span></div>
                                                </div>
                                          </div>
                                    );
                              })()} */}
                              {/* Radar pings for critical states */}
                              {/* {Object.entries(STATE_POSITIONS).map(([key, pos]) => {
                                    if (!NIGERIA_STATES[key] || pos.w === 0) return null;
                                    const d = NIGERIA_STATES[key];
                                    if (d.alertLevel !== "CRITICAL") return null;
                                    const cx = ((pos.x + pos.w / 2) / 60) * 100;
                                    const cy = ((pos.y + pos.h / 2) / 65) * 100;
                                    return <RadarPing key={key} x={cx} y={cy} color={ALERT_CONFIG.CRITICAL.color} />;
                              })} */}
                        </div>

                        {/* ── Right Panel: Selected State Detail ── */}
                        <div
                              className="w-64 flex-shrink-0 flex flex-col border-l overflow-y-auto"
                              style={{
                                    borderColor: '#d4a01720',
                                    background: '#0a080280',
                              }}
                        >
                              {activeState &&
                                    (() => {
                                          const alert =
                                                ALERT_CONFIG[
                                                      activeState.alertLevel
                                                ];
                                          return (
                                                <>
                                                      {/* State Header */}
                                                      <div
                                                            className="p-4 border-b"
                                                            style={{
                                                                  borderColor:
                                                                        '#d4a01720',
                                                                  background: `linear-gradient(180deg, ${alert.color}12, transparent)`,
                                                            }}
                                                      >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                  <div
                                                                        className="w-2 h-2 rounded-full animate-pulse"
                                                                        style={{
                                                                              backgroundColor:
                                                                                    alert.color,
                                                                              boxShadow: `0 0 6px ${alert.color}`,
                                                                        }}
                                                                  />
                                                                  <span
                                                                        className="text-[9px] tracking-[0.3em]"
                                                                        style={{
                                                                              color: alert.color,
                                                                        }}
                                                                  >
                                                                        {
                                                                              alert.label
                                                                        }{' '}
                                                                        ZONE
                                                                  </span>
                                                            </div>
                                                            <div
                                                                  className="text-xl font-bold tracking-wider"
                                                                  style={{
                                                                        color: '#fbbf24',
                                                                        textShadow: `0 0 16px ${alert.color}60`,
                                                                  }}
                                                            >
                                                                  {activeState.name.toUpperCase()}
                                                            </div>
                                                            <div
                                                                  className="text-[10px] tracking-widest mt-0.5"
                                                                  style={{
                                                                        color: '#d4a01788',
                                                                  }}
                                                            >
                                                                  {
                                                                        activeState.region
                                                                  }{' '}
                                                                  · Capital:{' '}
                                                                  {
                                                                        activeState.capital
                                                                  }
                                                            </div>
                                                      </div>
                                                      <div className="p-4 flex flex-col gap-4">
                                                            {/* Security Gauge */}
                                                            <div>
                                                                  <div
                                                                        className="text-[9px] tracking-[0.3em] uppercase mb-2"
                                                                        style={{
                                                                              color: '#d4a01766',
                                                                        }}
                                                                  >
                                                                        SECURITY
                                                                        INDEX
                                                                  </div>
                                                                  <div className="relative h-16 flex items-center justify-center">
                                                                        <svg
                                                                              viewBox="0 0 100 60"
                                                                              className="w-full h-full"
                                                                        >
                                                                              <path
                                                                                    d="M10,50 A40,40 0 0,1 90,50"
                                                                                    fill="none"
                                                                                    stroke="#d4a01720"
                                                                                    strokeWidth="6"
                                                                                    strokeLinecap="round"
                                                                              />
                                                                              <path
                                                                                    d="M10,50 A40,40 0 0,1 90,50"
                                                                                    fill="none"
                                                                                    stroke={
                                                                                          activeState.securityIndex >
                                                                                          60
                                                                                                ? '#22c55e'
                                                                                                : activeState.securityIndex >
                                                                                                    35
                                                                                                  ? '#f59e0b'
                                                                                                  : '#ef4444'
                                                                                    }
                                                                                    strokeWidth="6"
                                                                                    strokeLinecap="round"
                                                                                    strokeDasharray={`${(activeState.securityIndex / 100) * 126} 126`}
                                                                              />
                                                                              <text
                                                                                    x="50"
                                                                                    y="54"
                                                                                    textAnchor="middle"
                                                                                    fontSize="16"
                                                                                    fontWeight="bold"
                                                                                    fill="#fbbf24"
                                                                              >
                                                                                    {
                                                                                          activeState.securityIndex
                                                                                    }
                                                                              </text>
                                                                        </svg>
                                                                  </div>
                                                            </div>
                                                            {/* Intel rows */}
                                                            <div
                                                                  className="border-t pt-3"
                                                                  style={{
                                                                        borderColor:
                                                                              '#d4a01720',
                                                                  }}
                                                            >
                                                                  <div
                                                                        className="text-[9px] tracking-[0.3em] uppercase mb-3"
                                                                        style={{
                                                                              color: '#d4a01766',
                                                                        }}
                                                                  >
                                                                        INTELLIGENCE
                                                                  </div>
                                                                  <StatRow
                                                                        label="Population"
                                                                        value={`${activeState.population}M`}
                                                                        max={
                                                                              15.4
                                                                        }
                                                                  />
                                                                  <StatRow
                                                                        label="GDP Output"
                                                                        value={`$${activeState.gdp}B`}
                                                                        max={35}
                                                                  />
                                                                  <StatRow
                                                                        label="Alert Level"
                                                                        value={
                                                                              activeState.alertLevel
                                                                        }
                                                                        color={
                                                                              alert.color
                                                                        }
                                                                  />
                                                                  <StatRow
                                                                        label="Primary Resource"
                                                                        value={
                                                                              activeState.resourceType
                                                                        }
                                                                  />
                                                            </div>
                                                            {/* Resource type badge */}
                                                            <div
                                                                  className="border rounded p-3"
                                                                  style={{
                                                                        borderColor:
                                                                              '#d4a01730',
                                                                        backgroundColor:
                                                                              '#d4a01708',
                                                                  }}
                                                            >
                                                                  <div
                                                                        className="text-[8px] tracking-widest uppercase mb-1"
                                                                        style={{
                                                                              color: '#d4a01766',
                                                                        }}
                                                                  >
                                                                        Strategic
                                                                        Asset
                                                                  </div>
                                                                  <div
                                                                        className="text-sm font-bold"
                                                                        style={{
                                                                              color: '#fbbf24',
                                                                        }}
                                                                  >
                                                                        {
                                                                              activeState.resourceType
                                                                        }
                                                                  </div>
                                                            </div>
                                                            {/* Comparison to national avg */}
                                                            <div
                                                                  className="border-t pt-3"
                                                                  style={{
                                                                        borderColor:
                                                                              '#d4a01720',
                                                                  }}
                                                            >
                                                                  <div
                                                                        className="text-[9px] tracking-[0.3em] uppercase mb-3"
                                                                        style={{
                                                                              color: '#d4a01766',
                                                                        }}
                                                                  >
                                                                        VS
                                                                        NATIONAL
                                                                        AVG
                                                                  </div>
                                                                  {[
                                                                        {
                                                                              label: 'Security',
                                                                              val: activeState.securityIndex,
                                                                              avg: avgSecurity,
                                                                              unit: '',
                                                                        },
                                                                        {
                                                                              label: 'Population',
                                                                              val: activeState.population,
                                                                              avg:
                                                                                    totalPop /
                                                                                    37,
                                                                              unit: 'M',
                                                                        },
                                                                        {
                                                                              label: 'GDP',
                                                                              val: activeState.gdp,
                                                                              avg:
                                                                                    totalGdp /
                                                                                    37,
                                                                              unit: 'B',
                                                                        },
                                                                  ].map(
                                                                        ({
                                                                              label,
                                                                              val,
                                                                              avg,
                                                                              unit,
                                                                        }) => {
                                                                              const diff =
                                                                                    ((val -
                                                                                          avg) /
                                                                                          avg) *
                                                                                    100;
                                                                              const pos =
                                                                                    diff >=
                                                                                    0;
                                                                              return (
                                                                                    <div
                                                                                          key={
                                                                                                label
                                                                                          }
                                                                                          className="flex items-center justify-between mb-1.5"
                                                                                    >
                                                                                          <span
                                                                                                className="text-[9px]"
                                                                                                style={{
                                                                                                      color: '#d4a01788',
                                                                                                }}
                                                                                          >
                                                                                                {
                                                                                                      label
                                                                                                }
                                                                                          </span>
                                                                                          <div className="flex items-center gap-1">
                                                                                                <span
                                                                                                      className="text-[8px]"
                                                                                                      style={{
                                                                                                            color: pos
                                                                                                                  ? '#22c55e'
                                                                                                                  : '#ef4444',
                                                                                                      }}
                                                                                                >
                                                                                                      {pos
                                                                                                            ? '▲'
                                                                                                            : '▼'}{' '}
                                                                                                      {Math.abs(
                                                                                                            diff
                                                                                                      ).toFixed(
                                                                                                            0
                                                                                                      )}
                                                                                                      %
                                                                                                </span>
                                                                                                <span
                                                                                                      className="text-[9px] font-mono"
                                                                                                      style={{
                                                                                                            color: '#fbbf24',
                                                                                                      }}
                                                                                                >
                                                                                                      {
                                                                                                            val
                                                                                                      }
                                                                                                      {
                                                                                                            unit
                                                                                                      }
                                                                                                </span>
                                                                                          </div>
                                                                                    </div>
                                                                              );
                                                                        }
                                                                  )}
                                                            </div>
                                                            {/* Quick access other states */}
                                                            <div
                                                                  className="border-t pt-3"
                                                                  style={{
                                                                        borderColor:
                                                                              '#d4a01720',
                                                                  }}
                                                            >
                                                                  <div
                                                                        className="text-[9px] tracking-[0.3em] uppercase mb-2"
                                                                        style={{
                                                                              color: '#d4a01766',
                                                                        }}
                                                                  >
                                                                        OTHER
                                                                        CRITICAL
                                                                        ZONES
                                                                  </div>
                                                                  {allStates
                                                                        .filter(
                                                                              (
                                                                                    s
                                                                              ) =>
                                                                                    s.alertLevel ===
                                                                                          'CRITICAL' &&
                                                                                    s.id !==
                                                                                          activeState.id
                                                                        )
                                                                        .slice(
                                                                              0,
                                                                              5
                                                                        )
                                                                        .map(
                                                                              (
                                                                                    s
                                                                              ) => (
                                                                                    <button
                                                                                          key={
                                                                                                s.id
                                                                                          }
                                                                                          onClick={() => {
                                                                                                setSelectedState(
                                                                                                      s.id
                                                                                                );
                                                                                                setHoveredState(
                                                                                                      null
                                                                                                );
                                                                                          }}
                                                                                          className="w-full text-left flex items-center justify-between py-1 px-2 mb-1 border transition-all hover:border-red-600"
                                                                                          style={{
                                                                                                borderColor:
                                                                                                      '#ef444430',
                                                                                                backgroundColor:
                                                                                                      '#ef444408',
                                                                                          }}
                                                                                    >
                                                                                          <div className="flex items-center gap-1.5">
                                                                                                <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                                                                                                <span
                                                                                                      className="text-[9px] tracking-wider"
                                                                                                      style={{
                                                                                                            color: '#d4a01799',
                                                                                                      }}
                                                                                                >
                                                                                                      {
                                                                                                            s.name
                                                                                                      }
                                                                                                </span>
                                                                                          </div>
                                                                                          <span
                                                                                                className="text-[8px]"
                                                                                                style={{
                                                                                                      color: '#ef4444',
                                                                                                }}
                                                                                          >
                                                                                                {
                                                                                                      s.securityIndex
                                                                                                }
                                                                                          </span>
                                                                                    </button>
                                                                              )
                                                                        )}
                                                            </div>
                                                      </div>
                                                </>
                                          );
                                    })()}
                        </div>
                  </div>

                  {/* ── Footer ── */}
                  <div
                        className="flex items-center justify-between px-6 py-2 border-t text-[8px] tracking-widest"
                        style={{
                              borderColor: '#d4a01720',
                              color: '#d4a01744',
                              background: '#0a0802',
                        }}
                  >
                        <span>
                              CLASSIFICATION: OPEN SOURCE INTELLIGENCE · OSINT
                              LAYER 1
                        </span>
                        <span className="flex items-center gap-4">
                              <span>37 ADMINISTRATIVE UNITS MONITORED</span>
                              <span>
                                    CRITICAL: {criticalCount} · HIGH:{' '}
                                    {highCount}
                              </span>
                              <span style={{ color: '#d4a01766' }}>
                                    GRID REF: 4°N–14°N · 3°E–15°E
                              </span>
                        </span>
                  </div>
            </div>
      );
}
