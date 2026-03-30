import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const FONT_SIZES = ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
const FONT_WEIGHTS = ['normal', 'medium', 'semibold', 'bold', 'extrabold'];
const IMAGE_POSITIONS = ['top', 'center', 'bottom', 'background'];
const ANIMATIONS = ['none', 'fadeIn', 'slideLeft', 'slideUp', 'bounce', 'pulse'];

const FONT_FAMILIES = [
  { value: 'default',     label: 'Default (System)',   css: 'inherit' },
  { value: 'poppins',     label: 'Poppins',            css: "'Poppins', sans-serif" },
  { value: 'inter',       label: 'Inter',              css: "'Inter', sans-serif" },
  { value: 'roboto',      label: 'Roboto',             css: "'Roboto', sans-serif" },
  { value: 'playfair',    label: 'Playfair Display',   css: "'Playfair Display', serif" },
  { value: 'montserrat',  label: 'Montserrat',         css: "'Montserrat', sans-serif" },
  { value: 'raleway',     label: 'Raleway',            css: "'Raleway', sans-serif" },
  { value: 'oswald',      label: 'Oswald',             css: "'Oswald', sans-serif" },
  { value: 'lato',        label: 'Lato',               css: "'Lato', sans-serif" },
  { value: 'nunito',      label: 'Nunito',             css: "'Nunito', sans-serif" },
  { value: 'dancing',     label: 'Dancing Script',     css: "'Dancing Script', cursive" },
  { value: 'pacifico',    label: 'Pacifico',           css: "'Pacifico', cursive" },
];

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;600;700&family=Roboto:wght@400;700&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&family=Raleway:wght@400;700&family=Oswald:wght@400;700&family=Lato:wght@400;700&family=Nunito:wght@400;700&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap";

const ANIMATION_STYLES = `
  @keyframes lp-fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes lp-slideLeft { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
  @keyframes lp-slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
  @keyframes lp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .lp-anim-fadeIn   { animation: lp-fadeIn 1s ease forwards; }
  .lp-anim-slideLeft{ animation: lp-slideLeft 0.8s ease forwards; }
  .lp-anim-slideUp  { animation: lp-slideUp 0.8s ease forwards; }
  .lp-anim-bounce   { animation: lp-bounce 1.5s ease infinite; }
  .lp-anim-pulse    { animation: lp-pulse 2s ease infinite; }
`;

const fontSizeMap = {
  sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl',
  '2xl': 'text-2xl', '3xl': 'text-3xl', '4xl': 'text-4xl', '5xl': 'text-5xl'
};
const fontWeightMap = {
  normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold',
  bold: 'font-bold', extrabold: 'font-extrabold'
};

export default function LoginPageEditor() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    lines: [], bgColor: '#4c1d95', showImage: false, imageUrl: '', imagePosition: 'bottom',
    imageWidth: 100, imageHeight: 200, imageMarginTop: 0, imageMarginLeft: 0, imagePaddingLeft: 0,
    panelPaddingX: 48, panelPaddingY: 48,
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/login-page`)
      .then(r => r.json())
      .then(d => { if (d.success) setContent(d.data); });
  }, []);

  const updateLine = (i, field, val) => {
    const lines = [...content.lines];
    lines[i] = { ...lines[i], [field]: val };
    setContent(c => ({ ...c, lines }));
  };

  const addLine = () => setContent(c => ({
    ...c, lines: [...c.lines, { text: 'New line', color: '#ffffff', fontSize: 'lg', fontWeight: 'normal' }]
  }));

  const removeLine = (i) => setContent(c => ({ ...c, lines: c.lines.filter((_, idx) => idx !== i) }));

  const moveLine = (i, dir) => {
    const lines = [...content.lines];
    const j = i + dir;
    if (j < 0 || j >= lines.length) return;
    [lines[i], lines[j]] = [lines[j], lines[i]];
    setContent(c => ({ ...c, lines }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/login-page`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(content)
      });
      const d = await res.json();
      if (d.success) toast.success('Login page updated!');
      else toast.error(d.message);
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const card = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const input = `w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const label = `text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style>{ANIMATION_STYLES}</style>
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
      <div className="w-full px-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Login Page Editor</h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Customize the left panel of the login page
            </p>
          </div>
          <button onClick={save} disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Editor — narrow left */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Background color */}
            <div className={`rounded-xl border p-4 ${card}`}>
              <h3 className="font-semibold text-sm mb-3">Background Color</h3>
              <div className="flex items-center gap-3">
                <input type="color" value={content.bgColor}
                  onChange={e => setContent(c => ({ ...c, bgColor: e.target.value }))}
                  className="w-12 h-10 rounded cursor-pointer border-0" />
                <input type="text" value={content.bgColor}
                  onChange={e => setContent(c => ({ ...c, bgColor: e.target.value }))}
                  className={`${input} flex-1`} placeholder="#4c1d95" />
              </div>
            </div>

            {/* Panel padding */}
            <div className={`rounded-xl border p-4 ${card}`}>
              <h3 className="font-semibold text-sm mb-3">Panel Padding</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Horizontal (px)</label>
                  <input type="number" value={content.panelPaddingX}
                    onChange={e => setContent(c => ({ ...c, panelPaddingX: Number(e.target.value) }))}
                    className={input} min={0} max={200} />
                </div>
                <div>
                  <label className={label}>Vertical (px)</label>
                  <input type="number" value={content.panelPaddingY}
                    onChange={e => setContent(c => ({ ...c, panelPaddingY: Number(e.target.value) }))}
                    className={input} min={0} max={200} />
                </div>
              </div>
            </div>

            {/* Image settings */}
            <div className={`rounded-xl border p-4 ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Image</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full transition-colors ${content.showImage ? 'bg-purple-600' : 'bg-gray-400'}`}
                    onClick={() => setContent(c => ({ ...c, showImage: !c.showImage }))}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${content.showImage ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs">{content.showImage ? 'On' : 'Off'}</span>
                </label>
              </div>
              {content.showImage && (
                <div className="space-y-3">
                  <div>
                    <label className={label}>Image URL</label>
                    <input type="text" value={content.imageUrl}
                      onChange={e => setContent(c => ({ ...c, imageUrl: e.target.value }))}
                      className={input} placeholder="https://..." />
                  </div>
                  <div>
                    <label className={label}>Position</label>
                    <select value={content.imagePosition}
                      onChange={e => setContent(c => ({ ...c, imagePosition: e.target.value }))}
                      className={input}>
                      {IMAGE_POSITIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={label}>Width (%)</label>
                      <input type="number" value={content.imageWidth}
                        onChange={e => setContent(c => ({ ...c, imageWidth: Number(e.target.value) }))}
                        className={input} min={10} max={100} />
                    </div>
                    <div>
                      <label className={label}>Height (px)</label>
                      <input type="number" value={content.imageHeight}
                        onChange={e => setContent(c => ({ ...c, imageHeight: Number(e.target.value) }))}
                        className={input} min={50} max={600} />
                    </div>
                    <div>
                      <label className={label}>Margin Top (px)</label>
                      <input type="number" value={content.imageMarginTop}
                        onChange={e => setContent(c => ({ ...c, imageMarginTop: Number(e.target.value) }))}
                        className={input} min={-200} max={200} />
                    </div>
                    <div>
                      <label className={label}>Margin Left (px)</label>
                      <input type="number" value={content.imageMarginLeft}
                        onChange={e => setContent(c => ({ ...c, imageMarginLeft: Number(e.target.value) }))}
                        className={input} min={-200} max={200} />
                    </div>
                    <div>
                      <label className={label}>Padding Left (px)</label>
                      <input type="number" value={content.imagePaddingLeft}
                        onChange={e => setContent(c => ({ ...c, imagePaddingLeft: Number(e.target.value) }))}
                        className={input} min={0} max={200} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Text lines */}
            <div className={`rounded-xl border p-4 ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Text Lines</h3>
                <button onClick={addLine}
                  className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                  + Add Line
                </button>
              </div>
              <div className="space-y-3">
                {content.lines.map((line, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>{i + 1}</span>
                      <input type="text" value={line.text}
                        onChange={e => updateLine(i, 'text', e.target.value)}
                        className={`${input} flex-1`} placeholder="Line text..." />
                      <input type="color" value={line.color}
                        onChange={e => updateLine(i, 'color', e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border-0 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={line.fontSize} onChange={e => updateLine(i, 'fontSize', e.target.value)}
                        className={`${input} flex-1`}>
                        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={line.fontWeight} onChange={e => updateLine(i, 'fontWeight', e.target.value)}
                        className={`${input} flex-1`}>
                        {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <select value={line.animation || 'none'} onChange={e => updateLine(i, 'animation', e.target.value)}
                        className={`${input} flex-1`} title="Animation">
                        {ANIMATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    {/* Font family row */}
                    <div className="mt-1">
                      <label className={label}>Font Family</label>
                      <select value={line.fontFamily || 'default'} onChange={e => updateLine(i, 'fontFamily', e.target.value)}
                        className={input}>
                        {FONT_FAMILIES.map(f => (
                          <option key={f.value} value={f.value} style={{ fontFamily: f.css }}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-1 mt-1">
                      <button onClick={() => moveLine(i, -1)} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>↑</button>
                      <button onClick={() => moveLine(i, 1)} className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>↓</button>
                      <button onClick={() => removeLine(i)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400">✕</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <label className={label}>Margin Top (px)</label>
                        <input type="number" value={line.marginTop ?? 0}
                          onChange={e => updateLine(i, 'marginTop', Number(e.target.value))}
                          className={input} min={-100} max={200} />
                      </div>
                      <div>
                        <label className={label}>Margin Left (px)</label>
                        <input type="number" value={line.marginLeft ?? 0}
                          onChange={e => updateLine(i, 'marginLeft', Number(e.target.value))}
                          className={input} min={-200} max={200} />
                      </div>
                      <div>
                        <label className={label}>Padding Left (px)</label>
                        <input type="number" value={line.paddingLeft ?? 0}
                          onChange={e => updateLine(i, 'paddingLeft', Number(e.target.value))}
                          className={input} min={0} max={200} />
                      </div>
                    </div>
                  </div>
                ))}
                {content.lines.length === 0 && (
                  <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No lines yet. Click "+ Add Line" to start.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview — takes remaining width */}
          <div className="flex-1 sticky top-6 self-start">
            <div className={`rounded-xl border p-4 ${card}`}>
              <h3 className="font-semibold text-sm mb-3">Live Preview</h3>
              <div className="rounded-xl overflow-hidden" style={{
                minHeight: '400px',
                backgroundColor: content.bgColor,
                position: 'relative',
                paddingLeft: content.panelPaddingX ?? 48,
                paddingRight: content.panelPaddingX ?? 48,
                paddingTop: content.panelPaddingY ?? 48,
                paddingBottom: content.panelPaddingY ?? 48,
              }}>
                {/* Background image */}
                {content.showImage && content.imageUrl && content.imagePosition === 'background' && (
                  <div className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${content.imageUrl})` }} />
                )}

                <div className="relative z-10 flex flex-col" style={{ minHeight: '300px' }}>
                  {/* Image top */}
                  {content.showImage && content.imageUrl && content.imagePosition === 'top' && (
                    <img src={content.imageUrl} alt="" className="object-contain rounded-lg mb-4"
                      style={{
                        width: `${content.imageWidth ?? 100}%`,
                        maxHeight: `${content.imageHeight ?? 200}px`,
                        marginTop: content.imageMarginTop ?? 0,
                        marginLeft: content.imageMarginLeft ?? 0,
                        paddingLeft: content.imagePaddingLeft ?? 0,
                      }} />
                  )}

                  {/* Text lines */}
                  <div>
                    {content.lines.map((line, i) => (
                      <p key={i}
                        className={`${fontSizeMap[line.fontSize] || 'text-base'} ${fontWeightMap[line.fontWeight] || 'font-normal'} leading-tight${line.animation && line.animation !== 'none' ? ` lp-anim-${line.animation}` : ''}`}
                        style={{
                          color: line.color,
                          marginTop: line.marginTop ?? 0,
                          marginLeft: line.marginLeft ?? 0,
                          paddingLeft: line.paddingLeft ?? 0,
                          animationDelay: `${i * 0.15}s`,
                          fontFamily: FONT_FAMILIES.find(f => f.value === (line.fontFamily || 'default'))?.css || 'inherit',
                        }}>
                        {line.text || <span className="opacity-30 italic text-white">empty</span>}
                      </p>
                    ))}
                  </div>

                  {/* Image center */}
                  {content.showImage && content.imageUrl && content.imagePosition === 'center' && (
                    <img src={content.imageUrl} alt="" className="object-contain rounded-lg mt-4"
                      style={{
                        width: `${content.imageWidth ?? 100}%`,
                        maxHeight: `${content.imageHeight ?? 200}px`,
                        marginTop: content.imageMarginTop ?? 0,
                        marginLeft: content.imageMarginLeft ?? 0,
                        paddingLeft: content.imagePaddingLeft ?? 0,
                      }} />
                  )}
                </div>

                {/* Image bottom */}
                {content.showImage && content.imageUrl && content.imagePosition === 'bottom' && (
                  <img src={content.imageUrl} alt="" className="relative z-10 object-contain rounded-lg"
                    style={{
                      width: `${content.imageWidth ?? 100}%`,
                      maxHeight: `${content.imageHeight ?? 200}px`,
                      marginTop: content.imageMarginTop ?? 0,
                      marginLeft: content.imageMarginLeft ?? 0,
                      paddingLeft: content.imagePaddingLeft ?? 0,
                    }} />
                )}

                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
