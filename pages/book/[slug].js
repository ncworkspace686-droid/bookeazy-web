import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import { generateSlots, formatTime, formatDate } from '../../lib/slots';

// ─── Colour tokens ────────────────────────────────────────────
const C = {
  primary:      '#4F46E5',
  primarySoft:  '#6366F1',
  primaryLight: '#EEF2FF',
  primaryDark:  '#3730A3',
  bg:           '#F5F6FF',
  white:        '#FFFFFF',
  ink:          '#1E1B4B',
  inkMuted:     '#6B7280',
  inkFaint:     '#9CA3AF',
  border:       '#E5E7EB',
  borderFocus:  '#6366F1',
  success:      '#10B981',
  successLight: '#ECFDF5',
  rose:         '#EF4444',
  roseBg:       '#FEF2F2',
  amber:        '#F59E0B',
};

const S = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(145deg, ${C.bg} 0%, #ECEEFF 100%)`,
    fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
    color: C.ink,
  },
  header: {
    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primarySoft} 50%, #818CF8 100%)`,
    padding: '36px 24px 40px',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  },
  headerBubble1: {
    position: 'absolute', top: -50, left: -50,
    width: 200, height: 200, borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
  },
  headerBubble2: {
    position: 'absolute', bottom: -40, right: -30,
    width: 160, height: 160, borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
  },
  headerOverlay: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bizIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  bizIcon: {
    width: 64, height: 64, borderRadius: 18,
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  bizName: {
    fontSize: 26, fontWeight: 800, color: '#fff',
    letterSpacing: '-0.5px', lineHeight: 1.2,
    margin: '0 0 6px', textShadow: '0 1px 8px rgba(0,0,0,0.15)',
  },
  bizSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 500 },
  body: { maxWidth: 540, margin: '0 auto', padding: '0 16px 60px' },
  instructionNote: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    background: C.roseBg,
    border: `1px solid rgba(239,68,68,0.2)`,
    borderRadius: '0 0 14px 14px',
    padding: '10px 16px 12px',
    marginBottom: 20,
    maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
  },
  instructionText: { fontSize: 12, color: C.rose, fontWeight: 600, margin: 0, lineHeight: 1.5 },
  card: {
    background: C.white, borderRadius: 18,
    border: `1px solid ${C.border}`,
    boxShadow: '0 2px 16px rgba(79,70,229,0.07)',
    padding: '20px 20px 24px', marginBottom: 16,
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    paddingBottom: 14, marginBottom: 16,
    borderBottom: `1px solid ${C.border}`,
  },
  cardIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 7 },
  fieldWrap: { marginBottom: 14 },
  input: {
    width: '100%', height: 46,
    background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '0 14px 0 40px',
    fontSize: 13, fontWeight: 500, color: C.ink,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
  },
  inputFocus: { borderColor: C.borderFocus, boxShadow: `0 0 0 3px rgba(99,102,241,0.12)` },
  select: {
    width: '100%', height: 46,
    background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '0 36px 0 40px',
    fontSize: 13, fontWeight: 500, color: C.ink,
    outline: 'none', boxSizing: 'border-box',
    appearance: 'none', cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
  },
  textarea: {
    width: '100%', minHeight: 80,
    background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '12px 14px 12px 40px',
    fontSize: 13, fontWeight: 500, color: C.ink,
    outline: 'none', boxSizing: 'border-box', resize: 'vertical',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit', lineHeight: 1.5,
  },
  inputWrap: { position: 'relative' },
  iconLeft: {
    position: 'absolute', left: 13, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none', color: C.inkFaint,
  },
  iconLeftTextarea: { position: 'absolute', left: 13, top: 14, pointerEvents: 'none', color: C.inkFaint },
  chevron: {
    position: 'absolute', right: 12, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none', color: C.inkFaint,
  },
  datePicker: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '0 14px', height: 46, cursor: 'pointer',
  },
  dateText: { flex: 1, fontSize: 13, fontWeight: 500, color: C.ink },
  changeBtn: {
    fontSize: 12, fontWeight: 700, color: C.primary,
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
  },
  slotGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  slotBtn: (active, disabled) => ({
    padding: '9px 4px', borderRadius: 10,
    border: `1.5px solid ${active ? C.primary : C.border}`,
    background: active ? C.primary : disabled ? C.bg : C.white,
    color: active ? C.white : disabled ? C.inkFaint : C.ink,
    fontSize: 12, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.15s', fontFamily: 'inherit',
    boxShadow: active ? '0 4px 12px rgba(79,70,229,0.28)' : 'none',
  }),
  errorBox: {
    background: C.roseBg, border: `1px solid rgba(239,68,68,0.3)`,
    borderRadius: 12, padding: '12px 14px', marginBottom: 16,
    display: 'flex', alignItems: 'flex-start', gap: 8,
  },
  errorText: { fontSize: 13, color: C.rose, fontWeight: 600, margin: 0, lineHeight: 1.4 },
  submitBtn: (loading) => ({
    width: '100%', height: 52,
    background: loading ? C.primaryLight : `linear-gradient(135deg, ${C.primary} 0%, ${C.primarySoft} 100%)`,
    border: 'none', borderRadius: 14,
    color: loading ? C.primary : C.white,
    fontSize: 15, fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.35)',
    transition: 'all 0.2s', fontFamily: 'inherit', letterSpacing: '-0.2px',
  }),
  privacyCard: {
    background: C.primaryLight, border: `1px solid rgba(99,102,241,0.2)`,
    borderRadius: 14, padding: '14px 16px', marginBottom: 16,
    display: 'flex', alignItems: 'flex-start', gap: 12,
  },
  privacyIconWrap: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  privacyTitle: {
    fontSize: 11, fontWeight: 700, color: C.primary,
    margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  privacyText: { fontSize: 12, color: C.inkMuted, margin: 0, lineHeight: 1.6 },
  privacyEmail: { color: C.primary, fontWeight: 600, textDecoration: 'none' },
  footer: {
    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primarySoft} 100%)`,
    borderRadius: 14, padding: '14px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 8,
    boxShadow: '0 4px 16px rgba(79,70,229,0.25)',
  },
  footerIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  successPage: {
    minHeight: '100vh',
    background: `linear-gradient(145deg, ${C.bg} 0%, #ECEEFF 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24,
  },
  notFound: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', system-ui, sans-serif", background: C.bg, padding: 24,
  },
};

// ─── SVG Icon ─────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={d} />
  </svg>
);

const icons = {
  person:   'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z',
  calendar: 'M3 4h18v18H3zM3 9h18M8 2v4M16 2v4',
  clock:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  service:  'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  staff:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  notes:    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  check:    'M20 6 9 17l-5-5',
  chevDown: 'M6 9l6 6 6-6',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  alert:    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  info:     'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M11 12h1v4h1',
  logo:     'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
};

// ─── Input components ─────────────────────────────────────────
function StyledInput({ icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.inputWrap}>
      <span style={S.iconLeft}><Icon d={icons[icon]} size={15} color={focused ? C.primary : C.inkFaint} /></span>
      <input {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{ ...S.input, ...(focused ? S.inputFocus : {}), ...(props.style||{}) }} />
    </div>
  );
}

function StyledSelect({ icon, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.inputWrap}>
      <span style={S.iconLeft}><Icon d={icons[icon]} size={15} color={focused ? C.primary : C.inkFaint} /></span>
      <select {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...S.select, ...(focused ? S.inputFocus : {}) }}>{children}</select>
      <span style={S.chevron}><Icon d={icons.chevDown} size={14} color={C.inkFaint} /></span>
    </div>
  );
}

function Section({ icon, iconBg, iconColor, title, children }) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <div style={{ ...S.cardIconWrap, background: iconBg }}>
          <Icon d={icons[icon]} size={15} color={iconColor} />
        </div>
        <p style={S.cardTitle}>{title}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Date picker ──────────────────────────────────────────────
function DatePicker({ value, onChange, maxDays = 30 }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => { const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),1); });
  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setDate(today.getDate()+maxDays);
  const year=viewMonth.getFullYear(), month=viewMonth.getMonth();
  const daysInMonth=new Date(year,month+1,0).getDate(), firstDow=new Date(year,month,1).getDay();
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days=['Su','Mo','Tu','We','Th','Fr','Sa'];
  return (
    <div style={{ marginBottom:14 }}>
      <label style={S.label}>Date *</label>
      <div style={{ ...S.datePicker, borderColor:open?C.borderFocus:C.border, boxShadow:open?`0 0 0 3px rgba(99,102,241,0.12)`:'none' }}
        onClick={() => setOpen(o=>!o)}>
        <Icon d={icons.calendar} size={15} color={C.inkFaint} />
        <span style={S.dateText}>{formatDate(value)}</span>
        <button style={S.changeBtn} onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}>Change</button>
      </div>
      {open && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginTop:8, boxShadow:'0 8px 32px rgba(79,70,229,0.14)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <button onClick={()=>setViewMonth(new Date(year,month-1,1))} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:8, width:28, height:28, cursor:'pointer', fontSize:16 }}>‹</button>
            <span style={{ fontWeight:700, fontSize:13 }}>{months[month]} {year}</span>
            <button onClick={()=>setViewMonth(new Date(year,month+1,1))} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:8, width:28, height:28, cursor:'pointer', fontSize:16 }}>›</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
            {days.map(d=><div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:C.inkFaint, padding:'2px 0' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {Array(firstDow).fill(null).map((_,i)=><div key={`e${i}`}/>)}
            {Array(daysInMonth).fill(null).map((_,i)=>{
              const d=new Date(year,month,i+1);
              const isSel=d.toDateString()===value.toDateString();
              const isTod=d.toDateString()===today.toDateString();
              const dis=d<today||d>maxDate;
              return <button key={i} disabled={dis} onClick={()=>{onChange(d);setOpen(false);}}
                style={{ height:32, borderRadius:8, border:'none',
                  background:isSel?C.primary:isTod?C.primaryLight:'none',
                  color:isSel?'#fff':dis?C.inkFaint:C.ink,
                  fontSize:12, fontWeight:isSel?700:500,
                  cursor:dis?'not-allowed':'pointer', opacity:dis?0.4:1,
                  boxShadow:isSel?'0 2px 8px rgba(79,70,229,0.3)':'none' }}>{i+1}</button>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Slot picker ──────────────────────────────────────────────
function SlotPicker({ slots, selected, onChange, loading }) {
  if (loading) return (
    <div style={{ height:50, display:'flex', alignItems:'center', justifyContent:'center', background:C.primaryLight, borderRadius:12, marginBottom:14 }}>
      <div style={{ width:18, height:18, border:`2px solid ${C.primary}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
    </div>
  );
  if (!slots.length) return (
    <div style={{ padding:'12px 14px', background:C.bg, borderRadius:12, border:`1px solid ${C.border}`, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
      <Icon d={icons.clock} size={14} color={C.amber}/>
      <span style={{ fontSize:12, color:C.inkMuted }}>No slots available — try another date</span>
    </div>
  );
  return (
    <div style={{ marginBottom:14 }}>
      <div style={S.slotGrid}>
        {slots.map((slot,i)=>(
          <button key={i} disabled={!slot.isSelectable} onClick={()=>slot.isSelectable&&onChange(slot.start)}
            style={S.slotBtn(selected&&selected.getTime()===slot.start.getTime(),!slot.isSelectable)}>
            {formatTime(slot.start)}
            {!slot.isSelectable&&<div style={{ fontSize:9, fontStyle:'italic', marginTop:1, opacity:0.7 }}>unavailable</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Privacy consent ──────────────────────────────────────────
function PrivacyNotice({ bizName }) {
  const [expanded, setExpanded] = useState(false);
  const email = 'privacy@bokify.in';
  return (
    <div style={S.privacyCard}>
      <div style={S.privacyIconWrap}>
        <Icon d={icons.shield} size={15} color="#fff"/>
      </div>
      <div style={{ flex:1 }}>
        <p style={S.privacyTitle}>Data &amp; Privacy</p>
        <p style={S.privacyText}>
          By submitting, you consent to <strong style={{ color:C.ink }}>{bizName}</strong> storing
          your name and phone number to manage your appointment.
          {!expanded && (
            <button onClick={()=>setExpanded(true)}
              style={{ background:'none', border:'none', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', padding:'0 0 0 4px', fontFamily:'inherit' }}>
              Read more ›
            </button>
          )}
        </p>
        {expanded && (
          <p style={{ ...S.privacyText, marginTop:6 }}>
            Your data is used solely for appointment scheduling and will never be sold or shared
            with third parties. You may request deletion at any time by emailing{' '}
            <a href={`mailto:${email}`} style={S.privacyEmail}>{email}</a>
            {' '}with subject <em>"Delete my data"</em>.{' '}
            <button onClick={()=>setExpanded(false)}
              style={{ background:'none', border:'none', color:C.inkMuted, fontWeight:600, fontSize:11, cursor:'pointer', padding:0, fontFamily:'inherit' }}>
              Show less
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────
function PoweredBy() {
  return (
    <div style={S.footer}>
      <div style={S.footerIconWrap}>
        <Icon d={icons.logo} size={14} color="#fff"/>
      </div>
      <div>
        <p style={{ margin:0, fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.75)' }}>
          Appointment booking powered by
        </p>
        <p style={{ margin:0, fontSize:14, fontWeight:800, color:'#fff', letterSpacing:'-0.2px' }}>
          Bokify ✦
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function BookingPage({ business, schedule, services, staff, error }) {
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [phone,        setPhone]        = useState('');
  const [service,      setService]      = useState('');
  const [staffId,      setStaffId]      = useState('');
  const [notes,        setNotes]        = useState('');
  const [date,         setDate]         = useState(()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; });
  const [slots,        setSlots]        = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [formError,    setFormError]    = useState('');

  const cfg = business?.form_config || {};

  const loadSlots = useCallback(async (d) => {
    if (!business) return;
    setLoadingSlots(true); setSelectedSlot(null);
    try {
      const dateStr = d.toISOString().split('T')[0];
      const [blockedRes, apptsRes] = await Promise.all([
        supabase.from('blocked_times').select('start_time,end_time')
          .eq('business_id', business.id)
          .gte('start_time', `${dateStr}T00:00:00`).lte('end_time', `${dateStr}T23:59:59`),
        supabase.from('appointments').select('date_time')
          .eq('business_id', business.id)
          .gte('date_time', `${dateStr}T00:00:00`).lte('date_time', `${dateStr}T23:59:59`)
          .not('status', 'in', '("cancelled")'),
      ]);
      setSlots(generateSlots(schedule, blockedRes.data||[], apptsRes.data||[], d));
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  }, [business, schedule]);

  useEffect(() => { if (business) loadSlots(date); }, [date, business]);

  const handleSubmit = async () => {
    setFormError('');
    if (!firstName.trim()) { setFormError('Please enter your first name.'); return; }
    if (!lastName.trim())  { setFormError('Please enter your last name.'); return; }
    if (!phone.trim())     { setFormError('Please enter your phone number.'); return; }
    if (cfg.show_service && cfg.service_required && !service) { setFormError('Please select a service.'); return; }
    if (!selectedSlot)     { setFormError('Please select a time slot.'); return; }
    setSubmitting(true);
    try {
      const { error: apptErr } = await supabase.from('appointments').insert({
        id: crypto.randomUUID(), business_id: business.id,
        customer_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        customer_phone: phone.trim(), service_type: service||'',
        notes: notes.trim(), date_time: selectedSlot.toISOString(),
        slot_start: selectedSlot.toISOString(), staff_id: staffId||null,
        status:'pending', booking_status:'pending',
        payment_amount:0, payment_status:'pending',
        created_at: new Date().toISOString(),
      });
      if (apptErr) throw apptErr;
      const { data: existing } = await supabase.from('clients').select('id')
        .eq('business_id', business.id).eq('phone', phone.trim()).maybeSingle();
      if (!existing) {
        await supabase.from('clients').insert({
          business_id: business.id,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: phone.trim(), first_seen: selectedSlot.toISOString(), last_seen: selectedSlot.toISOString(),
        });
      } else {
        await supabase.from('clients').update({ last_seen: selectedSlot.toISOString() })
          .eq('business_id', business.id).eq('phone', phone.trim());
      }
      setSubmitted(true);
    } catch { setFormError('Could not submit booking. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (error || !business) return (
    <div style={S.notFound}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
        <h2 style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:20, fontWeight:800, color:C.ink, margin:'0 0 8px' }}>Business not found</h2>
        <p style={{ color:C.inkMuted, fontSize:14, fontFamily:"'DM Sans',system-ui,sans-serif" }}>This booking link may be invalid or expired.</p>
      </div>
    </div>
  );

  const bizInitials = business.business_name
    ? business.business_name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() : '?';

  if (submitted) return (
    <>
      <Head>
        <title>Booking Confirmed — {business.business_name}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>
      <div style={S.successPage}>
        <div style={{ background:C.white, borderRadius:24, border:`1px solid ${C.border}`, boxShadow:'0 8px 40px rgba(79,70,229,0.12)', padding:'40px 32px', textAlign:'center', maxWidth:400, width:'100%' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:C.successLight, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <Icon d={icons.check} size={32} color={C.success}/>
          </div>
          <h2 style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:22, fontWeight:800, color:C.ink, margin:'0 0 8px', letterSpacing:'-0.3px' }}>Booking Requested!</h2>
          <p style={{ color:C.inkMuted, fontSize:14, margin:'0 0 24px', lineHeight:1.5, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <strong style={{color:C.ink}}>{business.business_name}</strong> will confirm your appointment soon.
          </p>
          <div style={{ background:C.primaryLight, borderRadius:12, padding:'14px 16px', textAlign:'left' }}>
            <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:C.primary, textTransform:'uppercase', letterSpacing:'0.4px' }}>Your Appointment</p>
            <p style={{ margin:'4px 0', fontSize:14, color:C.ink, fontWeight:700 }}>{firstName} {lastName}</p>
            <p style={{ margin:'2px 0', fontSize:13, color:C.inkMuted }}>{formatDate(selectedSlot)} at {formatTime(selectedSlot)}</p>
            {service && <p style={{ margin:'2px 0', fontSize:13, color:C.inkMuted }}>{service}</p>}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>Book with {business.business_name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
          input::placeholder, textarea::placeholder { color: ${C.inkFaint}; }
          select option { color: ${C.ink}; }
        `}</style>
      </Head>

      <div style={S.page}>
        {/* Centered header */}
        <div style={S.header}>
          <div style={S.headerBubble1}/>
          <div style={S.headerBubble2}/>
          <div style={S.headerOverlay}/>
          <div style={{ position:'relative' }}>
            <div style={S.bizIconWrap}>
              <div style={S.bizIcon}>
                <span style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{bizInitials}</span>
              </div>
            </div>
            <h1 style={S.bizName}>{business.business_name}</h1>
            <p style={S.bizSub}>Online Appointment Booking</p>
          </div>
        </div>

        {/* Red instruction note — outside purple, before form */}
        <div style={{ maxWidth:540, margin:'0 auto' }}>
          <div style={S.instructionNote}>
            <Icon d={icons.info} size={14} color={C.rose} style={{ flexShrink:0, marginTop:1 }}/>
            <p style={S.instructionText}>
              Fields marked <strong>*</strong> are required. Please fill in your details carefully —
              your booking will be confirmed by the business after submission.
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ ...S.body, animation:'fadeUp 0.4s ease both' }}>
          {formError && (
            <div style={S.errorBox}>
              <Icon d={icons.alert} size={15} color={C.rose} style={{ flexShrink:0, marginTop:1 }}/>
              <p style={S.errorText}>{formError}</p>
            </div>
          )}

          <Section icon="person" iconBg={C.primaryLight} iconColor={C.primary} title="Your Details">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={S.label}>First Name *</label>
                <StyledInput icon="person" placeholder="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} autoComplete="given-name"/>
              </div>
              <div>
                <label style={S.label}>Last Name *</label>
                <StyledInput icon="person" placeholder="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} autoComplete="family-name"/>
              </div>
            </div>
            <label style={S.label}>Phone Number *</label>
            <StyledInput icon="phone" placeholder="9876543210" type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} autoComplete="tel"/>
          </Section>

          <Section icon="calendar" iconBg="#FFFBEB" iconColor={C.amber} title="Appointment">
            {(cfg.show_service !== false) && (
              <div style={S.fieldWrap}>
                <label style={S.label}>Service{cfg.service_required?' *':''}</label>
                <StyledSelect icon="service" value={service} onChange={e=>setService(e.target.value)}>
                  <option value="">{services.length===0?'No services available':'Select a service'}</option>
                  {services.map(s=><option key={s} value={s}>{s}</option>)}
                </StyledSelect>
              </div>
            )}
            {(cfg.show_staff !== false) && staff.length > 0 && (
              <div style={S.fieldWrap}>
                <label style={S.label}>Staff Preference{cfg.staff_required?' *':''}</label>
                <StyledSelect icon="staff" value={staffId} onChange={e=>setStaffId(e.target.value)}>
                  <option value="">No preference</option>
                  {staff.map(m=><option key={m.id} value={m.id}>{m.name}{m.role?` · ${m.role}`:''}</option>)}
                </StyledSelect>
              </div>
            )}
            <DatePicker value={date} onChange={d=>setDate(d)} maxDays={schedule?.advance_days||30}/>
            <label style={{ ...S.label, marginBottom:8 }}>Time Slot *</label>
            <SlotPicker slots={slots} selected={selectedSlot} onChange={setSelectedSlot} loading={loadingSlots}/>
          </Section>

          {(cfg.show_notes !== false) && (
            <Section icon="notes" iconBg={C.primaryLight} iconColor="#818CF8" title="Notes">
              <label style={S.label}>Notes{cfg.notes_required?' *':' (optional)'}</label>
              <div style={S.inputWrap}>
                <span style={S.iconLeftTextarea}><Icon d={icons.notes} size={15} color={C.inkFaint}/></span>
                <textarea placeholder="Any special requests or information..." value={notes} onChange={e=>setNotes(e.target.value)} style={S.textarea}/>
              </div>
            </Section>
          )}

          {/* Privacy consent */}
          <PrivacyNotice bizName={business.business_name}/>

          <button style={S.submitBtn(submitting)} onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <span style={{ width:16, height:16, border:'2px solid rgba(79,70,229,0.3)', borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
                Submitting…
              </span>
            ) : 'Confirm Booking'}
          </button>

          <div style={{ marginTop:16 }}><PoweredBy/></div>
        </div>
      </div>
    </>
  );
}

// ─── Server-side data fetch ───────────────────────────────────
export async function getServerSideProps({ params }) {
  const { slug } = params;
  try {
    const isUuid = /^[0-9a-f-]{36}$/.test(slug);
    let query = supabase.from('businesses').select('*');
    query = isUuid ? query.or(`slug.eq.${slug},id.eq.${slug}`) : query.eq('slug', slug);
    const { data: bizRows, error: bizErr } = await query.limit(1);
    if (bizErr || !bizRows?.length) return { props: { business:null, error:'Not found' } };
    const business = bizRows[0];
    const { data: scheduleRow } = await supabase.from('business_schedules').select('*').eq('business_id', business.id).maybeSingle();
    const { data: serviceRows } = await supabase.from('services').select('name').eq('business_id', business.id).eq('active', true).order('name');
    const { data: staffRows }   = await supabase.from('staff_members').select('id,name,role').eq('business_id', business.id).eq('is_active', true).order('name');
    return { props: { business, schedule:scheduleRow||null, services:(serviceRows||[]).map(r=>r.name), staff:staffRows||[], error:null } };
  } catch(e) {
    return { props: { business:null, error:e.message } };
  }
}
