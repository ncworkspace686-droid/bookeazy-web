import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import { generateSlots, formatTime, formatDate, validatePhone, getCountryFromWhatsapp } from '../../lib/slots';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:     '#4338CA',
  primaryMid:  '#6366F1',
  primarySoft: '#818CF8',
  primaryXL:   '#EEF2FF',
  accent:      '#F59E0B',
  accentLight: '#FFFBEB',
  ink:         '#18181B',
  inkMid:      '#3F3F46',
  inkMuted:    '#71717A',
  inkFaint:    '#A1A1AA',
  border:      '#E4E4E7',
  borderFocus: '#6366F1',
  surface:     '#FFFFFF',
  bg:          '#F4F4F8',
  bgDeep:      '#ECEEF8',
  success:     '#059669',
  successBg:   '#ECFDF5',
  rose:        '#DC2626',
  roseBg:      '#FEF2F2',
};

const FONT = "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif";

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: ${C.bg}; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  input::placeholder, textarea::placeholder { color: ${C.inkFaint}; }
  select option { color: ${C.ink}; background: white; }
  select::-ms-expand { display: none; }
  .hero-grain::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 128px 128px; mix-blend-mode: overlay; opacity: 0.6;
  }
  .slot-btn { transition: all .15s; }
  .slot-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .card-animate { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
  .card-animate:nth-child(1) { animation-delay: .05s }
  .card-animate:nth-child(2) { animation-delay: .1s }
  .card-animate:nth-child(3) { animation-delay: .15s }
  .card-animate:nth-child(4) { animation-delay: .2s }
  .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(67,56,202,.45) !important; }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn { transition: all .2s; }
`;

const Icon = ({ d, size = 16, color = 'currentColor', sx = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={sx}>
    <path d={d}/>
  </svg>
);
const icons = {
  person:   'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z',
  mail:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  map:      'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  calendar: 'M3 4h18v18H3zM3 9h18M8 2v4M16 2v4',
  clock:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  service:  'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  staff:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  notes:    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  check:    'M20 6 9 17l-5-5',
  chevDown: 'M6 9l6 6 6-6',
  chevLeft: 'M15 18l-6-6 6-6',
  chevRight:'M9 18l6-6-6-6',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  alert:    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  link:     'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  sparkle:  'M12 3v1M12 20v1M3 12h1M20 12h1M5.6 5.6l.7.7M17.7 17.7l.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  globe:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
};

// ─── Country codes (mirrors Flutter's country_codes.dart) ────────────────────
const COUNTRY_CODES = [
  { name: 'India',                flag: '🇮🇳', dialCode: '+91',  digitCount: 10 },
  { name: 'United States',        flag: '🇺🇸', dialCode: '+1',   digitCount: 10 },
  { name: 'United Kingdom',       flag: '🇬🇧', dialCode: '+44',  digitCount: 10 },
  { name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', digitCount: 9  },
  { name: 'Saudi Arabia',         flag: '🇸🇦', dialCode: '+966', digitCount: 9  },
  { name: 'Qatar',                flag: '🇶🇦', dialCode: '+974', digitCount: 8  },
  { name: 'Kuwait',               flag: '🇰🇼', dialCode: '+965', digitCount: 8  },
  { name: 'Bahrain',              flag: '🇧🇭', dialCode: '+973', digitCount: 8  },
  { name: 'Oman',                 flag: '🇴🇲', dialCode: '+968', digitCount: 8  },
  { name: 'Singapore',            flag: '🇸🇬', dialCode: '+65',  digitCount: 8  },
  { name: 'Malaysia',             flag: '🇲🇾', dialCode: '+60',  digitCount: 10 },
  { name: 'Australia',            flag: '🇦🇺', dialCode: '+61',  digitCount: 9  },
  { name: 'Canada',               flag: '🇨🇦', dialCode: '+1',   digitCount: 10 },
  { name: 'Germany',              flag: '🇩🇪', dialCode: '+49',  digitCount: 10 },
  { name: 'France',               flag: '🇫🇷', dialCode: '+33',  digitCount: 9  },
  { name: 'Netherlands',          flag: '🇳🇱', dialCode: '+31',  digitCount: 9  },
  { name: 'South Africa',         flag: '🇿🇦', dialCode: '+27',  digitCount: 9  },
  { name: 'Nigeria',              flag: '🇳🇬', dialCode: '+234', digitCount: 10 },
  { name: 'Kenya',                flag: '🇰🇪', dialCode: '+254', digitCount: 9  },
  { name: 'Nepal',                flag: '🇳🇵', dialCode: '+977', digitCount: 10 },
  { name: 'Bangladesh',           flag: '🇧🇩', dialCode: '+880', digitCount: 10 },
  { name: 'Sri Lanka',            flag: '🇱🇰', dialCode: '+94',  digitCount: 9  },
  { name: 'Pakistan',             flag: '🇵🇰', dialCode: '+92',  digitCount: 10 },
  { name: 'New Zealand',          flag: '🇳🇿', dialCode: '+64',  digitCount: 9  },
  { name: 'Other',                flag: '🌐',  dialCode: '+',    digitCount: 0  },
].sort((a, b) => b.dialCode.length - a.dialCode.length);

const DEFAULT_COUNTRY = COUNTRY_CODES.find(c => c.dialCode === '+91');

function inferCountryFromWhatsapp(whatsapp) {
  if (!whatsapp) return DEFAULT_COUNTRY;
  for (const c of COUNTRY_CODES) {
    if (c.dialCode === '+') continue;
    if (whatsapp.startsWith(c.dialCode)) return c;
  }
  return DEFAULT_COUNTRY;
}

function CountryPickerModal({ selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: C.surface, borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 540, maxHeight: '75vh',
        display: 'flex', flexDirection: 'column',
        animation: 'fadeUp .25s ease both',
      }} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
          <div style={{ width:40, height:4, borderRadius:2, background:C.border }}/>
        </div>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', padding:'8px 20px 12px', gap:12 }}>
          <p style={{ flex:1, fontSize:16, fontWeight:700, color:C.ink, fontFamily:FONT }}>
            Select Country Code
          </p>
          <button onClick={onClose} style={{
            background:'none', border:'none', cursor:'pointer',
            color:C.inkMuted, fontSize:20, lineHeight:1, padding:4,
          }}>✕</button>
        </div>
        {/* Search */}
        <div style={{ padding:'0 20px 12px' }}>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search country or code…"
            style={{
              width:'100%', height:42, borderRadius:10, border:`1px solid ${C.border}`,
              padding:'0 14px', fontSize:13, fontFamily:FONT, outline:'none',
              background:C.bg, color:C.ink, boxSizing:'border-box',
            }}/>
        </div>
        <div style={{ height:1, background:C.border }}/>
        {/* List */}
        <div style={{ overflowY:'auto', flex:1 }}>
          {filtered.map((c, i) => {
            const isSel = c.dialCode === selected.dialCode && c.name === selected.name;
            return (
              <div key={i} onClick={() => { onSelect(c); onClose(); }} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'12px 20px', cursor:'pointer',
                background: isSel ? C.primaryXL : 'transparent',
                borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize:22 }}>{c.flag}</span>
                <span style={{
                  flex:1, fontSize:14, fontFamily:FONT,
                  fontWeight: isSel ? 700 : 400, color: isSel ? C.primary : C.ink,
                }}>{c.name}</span>
                <span style={{ fontSize:13, color:C.inkMuted, fontWeight:600, fontFamily:FONT }}>
                  {c.dialCode}
                </span>
                {c.digitCount > 0 && (
                  <span style={{ fontSize:11, color:C.inkFaint, fontFamily:FONT }}>
                    ({c.digitCount}d)
                  </span>
                )}
                {isSel && <span style={{ color:C.primary, fontSize:16 }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StyledInput({ icon, ...props }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%', height: 48, background: C.surface,
    border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
    borderRadius: 12, padding: '0 14px 0 42px',
    fontSize: 14, fontWeight: 500, color: C.ink,
    outline: 'none', fontFamily: FONT, transition: 'border-color .15s, box-shadow .15s',
    boxShadow: focused ? `0 0 0 3px rgba(99,102,241,.12)` : 'none',
  };
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
        <Icon d={icons[icon]} size={15} color={focused ? C.primary : C.inkFaint}/>
      </span>
      <input {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{ ...base, ...(props.style||{}) }}/>
    </div>
  );
}

function StyledSelect({ icon, children, ...props }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%', height: 48, background: C.surface,
    border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
    borderRadius: 12, padding: '0 36px 0 42px',
    fontSize: 14, fontWeight: 500, color: C.ink,
    outline: 'none', appearance: 'none', cursor: 'pointer',
    fontFamily: FONT, transition: 'border-color .15s, box-shadow .15s',
    boxShadow: focused ? `0 0 0 3px rgba(99,102,241,.12)` : 'none',
  };
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
        <Icon d={icons[icon]} size={15} color={focused ? C.primary : C.inkFaint}/>
      </span>
      <select {...props}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={base}>{children}</select>
      <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
        <Icon d={icons.chevDown} size={14} color={C.inkFaint}/>
      </span>
    </div>
  );
}

function Card({ children, sx = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: C.surface, borderRadius: 20,
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 4px rgba(0,0,0,.04), 0 4px 20px rgba(67,56,202,.06)',
      padding: '22px 22px 24px', marginBottom: 14, ...sx,
    }}>{children}</div>
  );
}

function CardHeader({ icon, iconBg, iconColor, title }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:11, paddingBottom:16, marginBottom:18, borderBottom:`1px solid ${C.border}` }}>
      <div style={{ width:36, height:36, borderRadius:11, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon d={icons[icon]} size={16} color={iconColor}/>
      </div>
      <p style={{ fontSize:14, fontWeight:700, color:C.ink, letterSpacing:'-0.2px' }}>{title}</p>
    </div>
  );
}

const Label = ({ children, req }) => (
  <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.inkMid, marginBottom:7, letterSpacing:'0.1px' }}>
    {children}{req && <span style={{ color:C.rose, marginLeft:2 }}>*</span>}
  </label>
);

function DatePicker({ value, onChange, maxDays = 30 }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + maxDays);
  const yr = viewMonth.getFullYear(), mo = viewMonth.getMonth();
  const dim = new Date(yr, mo+1, 0).getDate();
  const fdow = new Date(yr, mo, 1).getDay();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  return (
    <div style={{ marginBottom: 16 }}>
      <Label req>Date</Label>
      <div onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:10, height:48,
        background: C.surface, border: `1.5px solid ${open ? C.borderFocus : C.border}`,
        borderRadius: 12, padding: '0 14px', cursor:'pointer',
        boxShadow: open ? `0 0 0 3px rgba(99,102,241,.12)` : 'none', transition:'all .15s',
      }}>
        <Icon d={icons.calendar} size={15} color={open ? C.primary : C.inkFaint}/>
        <span style={{ flex:1, fontSize:14, fontWeight:600, color:C.ink }}>{formatDate(value)}</span>
        <button onClick={e=>{e.stopPropagation();setOpen(o=>!o);}} style={{
          fontSize:12, fontWeight:700, color:C.primary, background:'none', border:'none', cursor:'pointer', fontFamily:FONT,
        }}>Change</button>
      </div>
      {open && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginTop:8, boxShadow:'0 16px 48px rgba(67,56,202,.15)', animation:'scaleIn .15s ease both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <button onClick={()=>setViewMonth(new Date(yr,mo-1,1))} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon d={icons.chevLeft} size={14} color={C.inkMuted}/>
            </button>
            <span style={{ fontWeight:800, fontSize:13, color:C.ink }}>{MONTHS[mo]} {yr}</span>
            <button onClick={()=>setViewMonth(new Date(yr,mo+1,1))} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon d={icons.chevRight} size={14} color={C.inkMuted}/>
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:800, color:C.inkFaint, padding:'2px 0', letterSpacing:'0.3px' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {Array(fdow).fill(null).map((_,i) => <div key={`e${i}`}/>)}
            {Array(dim).fill(null).map((_,i) => {
              const d = new Date(yr, mo, i+1);
              const isSel = d.toDateString() === value.toDateString();
              const isTod = d.toDateString() === today.toDateString();
              const dis = d < today || d > maxDate;
              return (
                <button key={i} disabled={dis} onClick={()=>{onChange(d);setOpen(false);}} style={{
                  height:34, borderRadius:10, border:'none',
                  background: isSel ? `linear-gradient(135deg,${C.primary},${C.primaryMid})` : isTod ? C.primaryXL : 'none',
                  color: isSel ? '#fff' : dis ? C.inkFaint : C.ink,
                  fontSize:12, fontWeight: isSel ? 800 : 500,
                  cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.35 : 1,
                  boxShadow: isSel ? '0 4px 12px rgba(67,56,202,.35)' : 'none',
                }}>{i+1}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SlotPicker({ slots, selected, onChange, loading, scheduleReady, hasSchedule }) {
  if (loading) return (
    <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'center', background:C.primaryXL, borderRadius:12, marginBottom:14 }}>
      <div style={{ width:18, height:18, border:`2.5px solid ${C.primarySoft}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
    </div>
  );

  if (scheduleReady && !hasSchedule) return (
    <div style={{ padding:'13px 16px', background:C.roseBg, borderRadius:12, border:`1px solid rgba(220,38,38,.2)`, marginBottom:14, display:'flex', alignItems:'center', gap:9 }}>
      <Icon d={icons.alert} size={14} color={C.rose}/>
      <span style={{ fontSize:13, color:C.rose, fontWeight:500 }}>Availability not set up yet — please contact the business directly.</span>
    </div>
  );

  const selectableSlots = slots.filter(s => s.isSelectable);

  if (!loading && slots.length > 0 && selectableSlots.length === 0) return (
    <div style={{ padding:'13px 16px', background:'#FFFBEB', borderRadius:12, border:`1px solid rgba(245,158,11,.25)`, marginBottom:14, display:'flex', alignItems:'center', gap:9 }}>
      <Icon d={icons.clock} size={14} color={C.accent}/>
      <span style={{ fontSize:13, color:C.inkMuted, fontWeight:500 }}>All slots are full or unavailable — try another date</span>
    </div>
  );

  if (!slots.length) return (
    <div style={{ padding:'13px 16px', background:'#FFFBEB', borderRadius:12, border:`1px solid rgba(245,158,11,.25)`, marginBottom:14, display:'flex', alignItems:'center', gap:9 }}>
      <Icon d={icons.clock} size={14} color={C.accent}/>
      <span style={{ fontSize:13, color:C.inkMuted, fontWeight:500 }}>No slots available — try another date</span>
    </div>
  );

  const selectedVal = selected ? selected.toISOString() : '';

  return (
    <div style={{ position:'relative', marginBottom:14 }}>
      <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', zIndex:1 }}>
        <Icon d={icons.clock} size={15} color={selected ? C.primary : C.inkMuted}/>
      </div>
      <select
        value={selectedVal}
        onChange={e => {
          const slot = selectableSlots.find(s => s.start.toISOString() === e.target.value);
          if (slot) onChange(slot.start);
        }}
        style={{
          width:'100%', height:52, paddingLeft:40, paddingRight:36,
          border:`1.5px solid ${selected ? C.primary : C.border}`,
          borderRadius:12,
          background: selected ? C.primaryXL : C.surface,
          color: selected ? C.primary : C.inkMid,
          fontSize:14, fontWeight:600, fontFamily:FONT,
          appearance:'none', WebkitAppearance:'none',
          cursor:'pointer', outline:'none',
          boxShadow: selected ? `0 0 0 3px ${C.primary}22` : '0 1px 3px rgba(0,0,0,.06)',
          transition:'border-color .15s, box-shadow .15s',
        }}
      >
        <option value="" disabled>Select a time slot</option>
        {selectableSlots.map((slot, i) => (
          <option key={i} value={slot.start.toISOString()}>
            {formatTime(slot.start)}
          </option>
        ))}
      </select>
      <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={selected ? C.primary : C.inkMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryMid} 100%)`,
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      flexWrap: 'wrap',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:22, height:22, borderRadius:6, background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon d={icons.sparkle} size={12} color="#fff"/>
        </div>
        <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.9)', letterSpacing:'-0.1px' }}>
          Powered by <strong style={{ color:'#fff' }}>BookEazy ✦</strong>
        </span>
      </div>
      <span style={{ fontSize:11, color:'rgba(255,255,255,.45)' }}>·</span>
      <a href="https://bookeazy-web.vercel.app/privacy" target="_blank" rel="noopener noreferrer"
        style={{ fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:600, textDecoration:'none', borderBottom:'1px solid rgba(255,255,255,.3)', paddingBottom:1 }}>
        Privacy Policy
      </a>
      <span style={{ fontSize:11, color:'rgba(255,255,255,.45)' }}>·</span>
      <span style={{ fontSize:11, color:'rgba(255,255,255,.55)' }}>© 2026 BookEazy</span>
    </div>
  );
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export default function BookingPage({ business, schedule, services, staff, error }) {
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [phone,        setPhone]        = useState('');
  const [email, setEmail] = useState('');

  

  // Country code — infer from business WhatsApp, default India
  const [selectedCountry, setSelectedCountry] = useState(() =>
    inferCountryFromWhatsapp(business?.whatsapp) || DEFAULT_COUNTRY);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const phoneMaxLength = selectedCountry.digitCount || 15;

  const [service,      setService]      = useState('');
  const [staffId,      setStaffId]      = useState('');
  const [notes,        setNotes]        = useState('');
  const [dob,          setDob]          = useState('');
  const [gender,       setGender]       = useState('');
  const [address,      setAddress]      = useState('');
  const [referral,     setReferral]     = useState('');
  const [date,         setDate]         = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [slots,        setSlots]        = useState([]);
  const [scheduleReady, setScheduleReady] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const submittingRef  = useRef(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [formError,    setFormError]    = useState('');

   const [liveServices,    setLiveServices]    = useState(services || []);
  const [liveStaff,       setLiveStaff]       = useState(staff || []);
  const [servicesFetched, setServicesFetched] = useState((services || []).length > 0);


  useEffect(() => {
    if (!business) return;
    (async () => {
      try {
        const [svcRes, stfRes] = await Promise.all([
          supabase.from('services').select('name').eq('business_id', business.id).eq('active', true).order('name'),
          supabase.from('staff_members').select('id,name,role').eq('business_id', business.id).eq('is_active', true).order('name'),
        ]);
        if (svcRes.data?.length)  setLiveServices(svcRes.data.map(r => r.name));
        if (stfRes.data?.length)  setLiveStaff(stfRes.data);
      } catch (e) {
        console.warn('[BookEazy] services/staff fetch error:', e);
      } finally {
        setServicesFetched(true);
      }
    })();
  }, [business?.id]);

  const rawCfg = (business?.form_config && typeof business.form_config === 'object')
    ? business.form_config : {};
  const safeVal = (key, fallback) => {
    const v = rawCfg[key];
    if (v === 'required' || v === 'optional' || v === 'hidden') return v;
    return fallback;
  };
  const cfg = {
    showService:     safeVal('service',       'optional') !== 'hidden',
    serviceRequired: safeVal('service',       'optional') === 'required',
    showStaff:       safeVal('staff',         'optional') !== 'hidden',
    staffRequired:   safeVal('staff',         'optional') === 'required',
    showNotes:       safeVal('notes',         'optional') !== 'hidden',
    notesRequired:   safeVal('notes',         'optional') === 'required',
    showEmail:       safeVal('email',         'hidden')   !== 'hidden',
    emailRequired:   safeVal('email',         'hidden')   === 'required',
    phoneRequired:   safeVal('phone',         'required') === 'required',
    showDob:         safeVal('date_of_birth', 'hidden')   !== 'hidden',
    dobRequired:     safeVal('date_of_birth', 'hidden')   === 'required',
    showGender:      safeVal('gender',        'hidden')   !== 'hidden',
    genderRequired:  safeVal('gender',        'hidden')   === 'required',
    showAddress:     safeVal('address',       'hidden')   !== 'hidden',
    addressRequired: safeVal('address',       'hidden')   === 'required',
    showReferral:    safeVal('referral',      'hidden')   !== 'hidden',
    referralRequired:safeVal('referral',      'hidden')   === 'required',
  };

  const [liveSchedule, setLiveSchedule] = useState(schedule || null);
  const [pauseUntil, setPauseUntil] = useState(
    business?.pause_bookings_until ? new Date(business.pause_bookings_until) : null
  );

  const pauseActive = !!(pauseUntil && pauseUntil > new Date());

  const pauseMessage = pauseUntil
    ? `Bookings are temporarily paused until ${formatDate(pauseUntil)} at ${formatTime(pauseUntil)}. Please try again later.`
    : 'Bookings are temporarily paused. Please try again later.';

  useEffect(() => {
    if (!business) return;
    (async () => {
      try {
        const [{ data: scheduleData }, { data: businessData }] = await Promise.all([
          supabase
            .from('business_schedules')
            .select('*')
            .eq('business_id', business.id)
            .maybeSingle(),
          supabase
            .from('businesses')
            .select('pause_bookings_until')
            .eq('id', business.id)
            .maybeSingle(),
        ]);

        if (scheduleData) setLiveSchedule(scheduleData);
        setPauseUntil(
          businessData?.pause_bookings_until
            ? new Date(businessData.pause_bookings_until)
            : null
        );
      } catch (e) {
        console.warn('[BookEazy] schedule/pause fetch error:', e);
      } finally {
        setScheduleReady(true);
      }
    })();
  }, [business?.id]);

  const loadSlots = useCallback(async (d) => {
    if (!business) return;

    if (pauseActive) {
      setSlots([]);
      setSelectedSlot(null);
      setLoadingSlots(false);
      return;
    }

    setLoadingSlots(true);
    setSelectedSlot(null);

    try {
      const startUtc = new Date(d);
      startUtc.setUTCHours(0, 0, 0, 0);

      const endUtc = new Date(d);
      endUtc.setUTCHours(23, 59, 59, 999);

    const dayStartIso = startUtc.toISOString();
const dayEndIso = endUtc.toISOString();

const [blockedRes, apptsRes] = await Promise.all([
  supabase.from('blocked_hours')
    .select('is_recurring,block_start_time,block_end_time,block_date,block_from_time,block_to_time,label')
    .eq('business_id', business.id),
  supabase.from('appointments')
    .select('slot_start,date_time,status,booking_status')
    .eq('business_id', business.id)
    .or(
      `and(date_time.gte.${dayStartIso},date_time.lte.${dayEndIso}),and(slot_start.gte.${dayStartIso},slot_start.lte.${dayEndIso})`
    )
    .neq('booking_status', 'denied')
    .neq('booking_status', 'reschedule_requested')
    .neq('status', 'cancelled')
    .neq('status', 'no_show')
]);


      const generatedSlots = generateSlots(
        liveSchedule,
        blockedRes.data || [],
        apptsRes.data || [],
        d
      );
      setSlots(generatedSlots);
    } catch (e) {
      console.warn('[BookEazy] loadSlots error:', e);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [business, liveSchedule, pauseActive]);

  useEffect(() => {
    if (!scheduleReady) return;
    loadSlots(date);
  }, [date, scheduleReady, loadSlots]);


  useEffect(() => {
    const hasData = firstName || lastName || phone || service || selectedSlot;
    if (!hasData || submitted) return;
    const handler = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [firstName, lastName, phone, service, selectedSlot, submitted]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    setFormError('');
    if (!firstName.trim()) { setFormError('Please enter your first name.'); return; }
    if (!lastName.trim())  { setFormError('Please enter your last name.');  return; }

   if (pauseActive) {
      setFormError(pauseMessage);
      setSelectedSlot(null);
      return;
    }


    const phoneClean = phone.replace(/\D/g, '');
    if (!phoneClean) { setFormError('Please enter your phone number.'); return; }

    // Digit count validation
    if (selectedCountry.digitCount > 0   && phoneClean.length !== selectedCountry.digitCount) {
      setFormError(`Enter a valid ${selectedCountry.digitCount}-digit number for ${selectedCountry.name}.`);
      return;
    }

const fullPhone = selectedCountry.dialCode === '+'
  ? `+ ${phoneClean}`.trim()
  : `${selectedCountry.dialCode} ${phoneClean}`.trim();

    if (cfg.showService && cfg.serviceRequired && !service) {
      setFormError(
        liveServices.length === 0
          ? 'This business has no active services set up yet. Please contact them directly.'
          : 'Please select a service.'
      );
      return;
    }

        if (!selectedSlot) { setFormError('Please select a time slot.'); return; }

    if (selectedSlot <= new Date()) {
      setFormError('The selected time slot has passed. Please choose another.');
      setSelectedSlot(null);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const startUtc = new Date(date);
      startUtc.setUTCHours(0, 0, 0, 0);
      const endUtc = new Date(date);
      endUtc.setUTCHours(23, 59, 59, 999);

           const dayStartIso = startUtc.toISOString();
const dayEndIso = endUtc.toISOString();

const [blockedRes, apptsRes, bizRes] = await Promise.all([
  supabase.from('blocked_hours')
    .select('is_recurring,block_start_time,block_end_time,block_date,block_from_time,block_to_time,label')
    .eq('business_id', business.id),
  supabase.from('appointments')
    .select('slot_start,date_time,status,booking_status')
    .eq('business_id', business.id)
    .or(
      `and(date_time.gte.${dayStartIso},date_time.lte.${dayEndIso}),and(slot_start.gte.${dayStartIso},slot_start.lte.${dayEndIso})`
    )
    .neq('booking_status', 'denied')
    .neq('booking_status', 'reschedule_requested')
    .neq('status', 'cancelled')
    .neq('status', 'no_show'),

  supabase.from('businesses')
    .select('pause_bookings_until')
    .eq('id', business.id)
    .maybeSingle(),
]);


      if (blockedRes.error) throw blockedRes.error;
      if (apptsRes.error) throw apptsRes.error;
      if (bizRes.error) throw bizRes.error;

      const latestPauseUntil = bizRes.data?.pause_bookings_until
        ? new Date(bizRes.data.pause_bookings_until)
        : null;

      if (latestPauseUntil && latestPauseUntil > new Date()) {
        setPauseUntil(latestPauseUntil);
        setSelectedSlot(null);
        setFormError(
          `Bookings are temporarily paused until ${formatDate(latestPauseUntil)} at ${formatTime(latestPauseUntil)}. Please try again later.`
        );
        return;
      }


      const latestSlots = generateSlots(
        liveSchedule,
        blockedRes.data || [],
        apptsRes.data || [],
        date
      );

      const stillAvailable = latestSlots.some(slot =>
        slot.isSelectable &&
        slot.start.toISOString() === selectedSlot.toISOString()
      );

      if (!stillAvailable) {
        setSlots(latestSlots);
        setSelectedSlot(null);
        setFormError('That time slot is no longer available. Please choose another.');
        return;
      }

     const payload = {
  id:             generateUUID(),
  business_id:    business.id,
  customer_name:  `${firstName.trim()} ${lastName.trim()}`.trim(),
  customer_phone: fullPhone,
  customer_email: email.trim(),
  service_type:   service || '',
  notes: [
    notes.trim(),
    dob      ? `DOB: ${dob}`           : '',
    gender   ? `Gender: ${gender}`     : '',
    address  ? `Address: ${address}`   : '',
    referral ? `Referral: ${referral}` : '',
  ].filter(Boolean).join('\n'),
  date_time:      selectedSlot.toISOString(),
  slot_start:     selectedSlot.toISOString(),
  staff_id:       staffId || null,
  status:         'pending',
  booking_status: 'pending',
  payment_amount: 0,
  payment_status: 'pending',
  created_at:     new Date().toISOString(),
};

let apptErr = null;

{
  const { error } = await supabase.from('appointments').insert(payload);
  apptErr = error;
}

if (apptErr) {
  const msg = String(apptErr.message || apptErr).toLowerCase();
  const slotConflict =
    payload.slot_start &&
    (msg.includes('slot_start') ||
     msg.includes('duplicate key') ||
     msg.includes('unique constraint') ||
     msg.includes('23505'));

  if (!slotConflict) throw apptErr;

  const retryPayload = {
    ...payload,
    slot_start: null,
  };

  const { error: retryErr } = await supabase
    .from('appointments')
    .insert(retryPayload);

  if (retryErr) throw retryErr;
}


  // Client upsert — non-fatal
      try {
        const { data: existing } = await supabase.from('clients').select('id')
          .eq('business_id', business.id).eq('phone', fullPhone).maybeSingle();
        if (!existing) {
          await supabase.from('clients').insert({
            business_id: business.id,
            name:        `${firstName.trim()} ${lastName.trim()}`.trim(),
            phone:       fullPhone,
            first_seen:  selectedSlot.toISOString(),
            last_seen:   selectedSlot.toISOString(),
          });
        } else {
          await supabase.from('clients').update({ last_seen: selectedSlot.toISOString() })
            .eq('business_id', business.id).eq('phone', fullPhone);
        }
      } catch (clientErr) {
        console.warn('[BookEazy] client upsert failed (non-fatal):', clientErr);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('[BookEazy] submit error:', err);
      setFormError('Could not submit booking. Please check your connection and try again.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // ── Error / not-found page ─────────────────────────────────────────────────
  if (error || !business) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:C.bg, fontFamily:FONT }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:0 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.ink, margin:'0 0 8px', letterSpacing:'-0.4px' }}>
          Business not found
        </h2>
        <p style={{ color:C.inkMuted, fontSize:14, textAlign:'center', maxWidth:320, lineHeight:1.55 }}>
          This booking link may be invalid or the business may no longer be on BookEazy.
        </p>
      </div>
      <Footer/>
    </div>
  );

  const bizInitials = business.business_name
    ? business.business_name.split(' ').slice(0,2).map(w => w[0] || '').join('').toUpperCase()
    : '?';

  // ── Success page ───────────────────────────────────────────────────────────
  if (submitted) return (
    <>
      <Head>
        <title>Booking Requested — {business.business_name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{GLOBAL_CSS}</style>
      </Head>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:C.bg, fontFamily:FONT }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ background:C.surface, borderRadius:24, border:`1px solid ${C.border}`, boxShadow:'0 8px 48px rgba(67,56,202,.14)', padding:'44px 36px', textAlign:'center', maxWidth:400, width:'100%', animation:'scaleIn .3s ease both' }}>
            <div style={{ width:76, height:76, borderRadius:'50%', background:C.successBg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 0 8px rgba(5,150,105,.08)' }}>
              <Icon d={icons.check} size={34} color={C.success}/>
            </div>
            <h2 style={{ fontSize:24, fontWeight:800, color:C.ink, margin:'0 0 8px', letterSpacing:'-0.4px' }}>Booking Requested!</h2>
            <p style={{ color:C.inkMuted, fontSize:14, margin:'0 0 28px', lineHeight:1.6 }}>
              <strong style={{color:C.ink}}>{business.business_name}</strong> will confirm your appointment shortly.
            </p>
            <div style={{ background:C.primaryXL, borderRadius:14, padding:'16px 18px', textAlign:'left', border:`1px solid rgba(99,102,241,.18)` }}>
              <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:800, color:C.primary, textTransform:'uppercase', letterSpacing:'0.6px' }}>Your Appointment</p>
              <p style={{ margin:'0 0 4px', fontSize:15, color:C.ink, fontWeight:800 }}>{firstName} {lastName}</p>
              <p style={{ margin:'0 0 2px', fontSize:13, color:C.inkMuted }}>{selectedSlot ? `${formatDate(selectedSlot)} at ${formatTime(selectedSlot)}` : ''}</p>
              {service && <p style={{ margin:'0', fontSize:13, color:C.inkMuted }}>{service}</p>}
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    </>
  );

  const bizPhone   = business.phone   || business.whatsapp || '';
  const bizEmail   = business.email   || '';
  const bizAddress = business.address || '';

  return (
    <>
      <Head>
        <title>Book with {business.business_name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{GLOBAL_CSS}</style>
      </Head>

      <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, color:C.ink, display:'flex', flexDirection:'column' }}>

        {/* ─── Hero Header ────────────────────────────────────────────────── */}
        <div className="hero-grain" style={{
          background: `linear-gradient(150deg, #312E81 0%, #4338CA 40%, #6366F1 75%, #818CF8 100%)`,
          padding: '48px 24px 0', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:-80, right:-60, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-40, left:-30, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.06)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:20, left:'30%', width:120, height:120, borderRadius:'50%', background:'rgba(245,158,11,.1)', pointerEvents:'none' }}/>

          <div style={{ maxWidth:540, margin:'0 auto', position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
              <div style={{
                width:80, height:80, borderRadius:22,
                background: 'rgba(255,255,255,.15)',
                border: '2.5px solid rgba(255,255,255,.4)',
                display: 'flex', alignItems:'center', justifyContent:'center',
                boxShadow: '0 16px 40px rgba(0,0,0,.2), 0 0 0 6px rgba(255,255,255,.08)',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>{bizInitials}</span>
              </div>
            </div>

            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.12)', borderRadius:20, padding:'4px 12px 4px 8px', marginBottom:12, border:'1px solid rgba(255,255,255,.2)' }}>
                <Icon d={icons.star} size={11} color="#FCD34D" sx={{ fill:'#FCD34D', stroke:'none' }}/>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.9)', letterSpacing:'0.3px' }}>ONLINE BOOKING FORM</span>
              </div>
              <h1 style={{ fontSize:30, fontWeight:800, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.6px', textShadow:'0 2px 12px rgba(0,0,0,.2)', lineHeight:1.15 }}>
                {business.business_name}
              </h1>
              {business.description && (
                <p style={{ fontSize:14, color:'rgba(255,255,255,.75)', margin:'0 0 4px', fontWeight:500, lineHeight:1.5 }}>
                  {business.description}
                </p>
              )}
            </div>

            {(bizPhone || bizEmail || bizAddress) && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:24 }}>
                {bizPhone && (
                  <a href={`tel:${bizPhone}`} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.22)', borderRadius:20, padding:'6px 12px', textDecoration:'none', backdropFilter:'blur(8px)' }}>
                    <Icon d={icons.phone} size={12} color="rgba(255,255,255,.9)"/>
                    <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>{bizPhone}</span>
                  </a>
                )}
                {bizEmail && (
                  <a href={`mailto:${bizEmail}`} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.22)', borderRadius:20, padding:'6px 12px', textDecoration:'none', backdropFilter:'blur(8px)' }}>
                    <Icon d={icons.mail} size={12} color="rgba(255,255,255,.9)"/>
                    <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>{bizEmail}</span>
                  </a>
                )}
                {bizAddress && (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.22)', borderRadius:20, padding:'6px 12px' }}>
                    <Icon d={icons.map} size={12} color="rgba(255,255,255,.9)"/>
                    <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>{bizAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ height:32, background:C.bg, borderRadius:'24px 24px 0 0', marginTop:4, position:'relative', zIndex:2 }}/>
        </div>

        {/* ─── Form body ──────────────────────────────────────────────────── */}
        <div style={{ flex:1, maxWidth:540, width:'100%', margin:'0 auto', padding:'4px 16px 48px' }}>

          {formError && (
            <div style={{ background: C.roseBg, border:`1.5px solid rgba(220,38,38,.25)`, borderRadius:14, padding:'13px 16px', marginBottom:16, display:'flex', alignItems:'flex-start', gap:10, animation:'scaleIn .2s ease both' }}>
              <Icon d={icons.alert} size={16} color={C.rose} sx={{ flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:13, color:C.rose, fontWeight:600, lineHeight:1.4 }}>{formError}</p>
            </div>
          )}

          {pauseActive && !formError && (
            <div style={{
              background: C.roseBg,
              border: `1.5px solid rgba(220,38,38,.25)`,
              borderRadius: 14,
              padding: '13px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <Icon d={icons.alert} size={16} color={C.rose} sx={{ flexShrink: 0, marginTop: 1 }}/>
              <p style={{ fontSize: 13, color: C.rose, fontWeight: 600, lineHeight: 1.4 }}>
                {pauseMessage}
              </p>
            </div>
          )}



          {/* ── Your Details ── */}
          <Card className="card-animate">
            <CardHeader icon="person" iconBg={C.primaryXL} iconColor={C.primary} title="Your Details"/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <Label req>First Name</Label>
                <StyledInput icon="person" placeholder="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} autoComplete="given-name"/>
              </div>
              <div>
                <Label req>Last Name</Label>
                <StyledInput icon="person" placeholder="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} autoComplete="family-name"/>
              </div>
            </div>

            {/* Phone with country code picker */}
            <Label req={cfg.phoneRequired}>Phone Number</Label>
            <div style={{ display:'flex', gap:8, marginBottom:4 }}>
              {/* Country code button */}
              <button
                onClick={() => setShowCountryPicker(true)}
                style={{
                  display:'flex', alignItems:'center', gap:6,
                  height:48, padding:'0 10px', flexShrink:0,
                  background:C.surface, border:`1.5px solid ${C.border}`,
                  borderRadius:12, cursor:'pointer', fontFamily:FONT,
                  whiteSpace:'nowrap',
                }}>
                <span style={{ fontSize:18 }}>{selectedCountry.flag}</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{selectedCountry.dialCode}</span>
                <Icon d={icons.chevDown} size={13} color={C.inkFaint}/>
              </button>
              {/* Phone input */}
              <div style={{ flex:1, position:'relative' }}>
                <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                  <Icon d={icons.phone} size={15} color={C.inkFaint}/>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0, phoneMaxLength))}
                  placeholder={selectedCountry.digitCount > 0 ? '0'.repeat(selectedCountry.digitCount) : 'Phone number'}
                  maxLength={phoneMaxLength}
                  autoComplete="tel"
                  style={{
                    width:'100%', height:48, background:C.surface,
                    border:`1.5px solid ${C.border}`, borderRadius:12,
                    padding:'0 14px 0 42px', fontSize:14, fontWeight:500,
                    color:C.ink, outline:'none', fontFamily:FONT,
                    boxSizing:'border-box',
                  }}/>
              </div>
            </div>
            {/* Digit counter */}
            {selectedCountry.digitCount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                <span style={{ fontSize:11, color: phone.length === phoneMaxLength ? C.success : C.inkMuted }}>
                  {phone.length === phoneMaxLength ? '✓ Looks good' : `${phoneMaxLength - phone.length} more digit${phoneMaxLength - phone.length === 1 ? '' : 's'} needed`}
                </span>
                <span style={{ fontSize:11, color: phone.length === phoneMaxLength ? C.success : C.inkFaint, fontWeight:600 }}>
                  {phone.length}/{phoneMaxLength}
                </span>
              </div>
            )}

 {cfg.showDob && (
              <div style={{ marginTop: 14 }}>
                <Label req={cfg.dobRequired}>Date of Birth</Label>
                <StyledInput
                  icon="calendar"
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                />
              </div>
            )}

            {cfg.showGender && (
              <div style={{ marginTop: 14 }}>
                <Label req={cfg.genderRequired}>Gender</Label>
                <StyledSelect icon="person" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </StyledSelect>
              </div>
            )}

            {cfg.showAddress && (
              <div style={{ marginTop: 14 }}>
                <Label req={cfg.addressRequired}>Address</Label>
                <StyledInput
                  icon="map"
                  placeholder="Your address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
            )}

            {cfg.showReferral && (
              <div style={{ marginTop: 14 }}>
                <Label req={cfg.referralRequired}>How did you hear about us?</Label>
                <StyledInput
                  icon="star"
                  placeholder="Instagram, friend, Google, etc."
                  value={referral}
                  onChange={e => setReferral(e.target.value)}
                />
              </div>
            )}


                        {cfg.showEmail && (
              <div style={{ marginTop: 14 }}>
                <Label req={cfg.emailRequired}>Email</Label>
                <StyledInput
                  icon="mail"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            )}
                         


  
          </Card>

          {/* ── Appointment Details ── */}
          <Card className="card-animate">
            <CardHeader icon="calendar" iconBg="#FFFBEB" iconColor={C.accent} title="Appointment Details"/>
            {cfg.showService && (
              <div style={{ marginBottom:14 }}>
                <Label req={cfg.serviceRequired}>Service</Label>
                <StyledSelect icon="service" value={service} onChange={e=>setService(e.target.value)}
                  disabled={servicesFetched && liveServices.length === 0}>
                  <option value="">
                    {!servicesFetched ? 'Loading services…' :
                     liveServices.length === 0 ? 'No services set up yet' : 'Select a service'}
                  </option>
                  {liveServices.map(s => <option key={s} value={s}>{s}</option>)}
                </StyledSelect>
                {servicesFetched && liveServices.length === 0 && cfg.serviceRequired && (
                  <p style={{ fontSize:11, color:C.rose, marginTop:5, fontWeight:600 }}>
                    ⚠ No active services set up — please contact the business directly.
                  </p>
                )}
              </div>
            )}
            {cfg.showStaff && liveStaff.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <Label req={cfg.staffRequired}>Staff Preference</Label>
                <StyledSelect icon="staff" value={staffId} onChange={e=>setStaffId(e.target.value)}>
                  <option value="">No preference</option>
                  {liveStaff.map(m => <option key={m.id} value={m.id}>{m.name}{m.role ? ` · ${m.role}` : ''}</option>)}
                </StyledSelect>
              </div>
            )}
            <DatePicker value={date} onChange={d=>setDate(d)} maxDays={liveSchedule?.advance_days||30}/>
            <Label req>Time Slot</Label>
            <SlotPicker
              slots={slots}
              selected={selectedSlot}
              onChange={setSelectedSlot}
              loading={loadingSlots}
              scheduleReady={scheduleReady}
              hasSchedule={!!liveSchedule}
            />
                
          </Card>
          
          {/* ── Notes ── */}
          {cfg.showNotes && (
            <Card className="card-animate">
              <CardHeader icon="notes" iconBg={C.primaryXL} iconColor={C.primarySoft} title="Additional Notes"/>
              <Label req={cfg.notesRequired}>Notes {!cfg.notesRequired && <span style={{ color:C.inkFaint, fontWeight:500 }}>(optional)</span>}</Label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:13, top:14, pointerEvents:'none' }}>
                  <Icon d={icons.notes} size={15} color={C.inkFaint}/>
                </span>
                <textarea placeholder="Any special requests or information..."
                  value={notes} onChange={e=>setNotes(e.target.value)}
                  style={{
                    width:'100%', minHeight:88, background:C.surface,
                    border:`1.5px solid ${C.border}`, borderRadius:12,
                    padding:'12px 14px 12px 42px', fontSize:14, fontWeight:500,
                    color:C.ink, outline:'none', resize:'vertical', fontFamily:FONT, lineHeight:1.5,
                  }}/>
              </div>
            </Card>
          )}

          {/* ── Submit ── */}
                    <button className="submit-btn" onClick={handleSubmit} disabled={submitting || pauseActive} style={{
            width:'100%', height:54,
            background: (submitting || pauseActive) ? C.primaryXL : `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryMid} 100%)`,
            border: 'none', borderRadius:16,
            fontSize:15, fontWeight:800, color: (submitting || pauseActive) ? C.primary : '#fff',
            cursor: (submitting || pauseActive) ? 'not-allowed' : 'pointer', fontFamily:FONT,
            letterSpacing:'-0.2px',
            boxShadow: (submitting || pauseActive) ? 'none' : '0 6px 24px rgba(67,56,202,.38)',
          }}>

            {submitting ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:9 }}>
                <span style={{ width:16, height:16, border:`2px solid rgba(67,56,202,.2)`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }}/>
                Submitting…
              </span>
             ) : pauseActive ? 'Bookings Temporarily Paused' : 'Confirm Booking →'}
          </button>
        </div>

        <Footer/>
      </div>

      {/* ── Country picker modal ── */}
      {showCountryPicker && (
        <CountryPickerModal
          selected={selectedCountry}
          onSelect={c => { setSelectedCountry(c); setPhone(''); }}
          onClose={() => setShowCountryPicker(false)}/>
      )}
    </>
  );
}

// ─── Server-side data ─────────────────────────────────────────────────────────
export async function getServerSideProps({ params }) {
  const { slug } = params;
  try {
    const cleanSlug = (slug || '').toLowerCase().trim();
    if (!cleanSlug) return { props: { business:null, error:'Invalid booking link' } };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(cleanSlug);
    let query = supabase.from('businesses').select('*');
    query = isUuid
      ? query.or(`slug.eq.${cleanSlug},id.eq.${cleanSlug}`)
      : query.eq('slug', cleanSlug);
    const { data: bizRows, error: bizErr } = await query.limit(1);

    if (bizErr || !bizRows?.length) {
      return { props: { business:null, error:'Not found' } };
    }

    const business = bizRows[0];

    if (typeof business.form_config === 'string') {
      try { business.form_config = JSON.parse(business.form_config); }
      catch { business.form_config = {}; }
    }

    const { data: scheduleRow } = await supabase
      .from('business_schedules').select('*')
      .eq('business_id', business.id).maybeSingle();
    const { data: serviceRows } = await supabase
      .from('services').select('name')
      .eq('business_id', business.id).eq('active', true).order('name');
    const { data: staffRows } = await supabase
      .from('staff_members').select('id,name,role')
      .eq('business_id', business.id).eq('is_active', true).order('name');

    return {
      props: {
        business,
        schedule: scheduleRow || null,
        services: (serviceRows || []).map(r => r.name),
        staff:    staffRows   || [],
        error:    null,
      }
    };
  } catch(e) {
    console.error('[BookEazy] getServerSideProps error:', e);
    return { props: { business:null, error:'Something went wrong. Please try again.' } };
  }
}
