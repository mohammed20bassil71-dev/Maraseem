import React, { useState } from 'react';
import {
  Code,
  Layers,
  Sparkles,
  Play,
  Copy,
  Check,
  Sliders,
  Palette,
  Film,
  Mail,
  Zap,
} from 'lucide-react';
import { InvitationTemplateSchema, ExperienceMode } from '../../types/template-schema';
import {
  FILM_STRIP_TEMPLATE_SCHEMA,
  ENVELOPE_REVEAL_TEMPLATE_SCHEMA,
  ORIENTAL_LANTERN_TEMPLATE_SCHEMA,
  BIRTHDAY_CAKE_TEMPLATE_SCHEMA,
  ACADEMIC_SCROLL_TEMPLATE_SCHEMA,
  RIBBON_CUTTING_TEMPLATE_SCHEMA,
  ALL_SCHEMAS,
} from '../../data/template-schemas';
import { InvitationEngine } from '../engine/InvitationEngine';

export const TemplateSchemaExplorer: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<ExperienceMode>('film-strip');
  const [activeSchema, setActiveSchema] = useState<InvitationTemplateSchema>(
    FILM_STRIP_TEMPLATE_SCHEMA
  );
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'schema_json' | 'scenes' | 'fields' | 'preview'>('schema_json');

  const handleSelectMode = (mode: ExperienceMode) => {
    setSelectedMode(mode);
    const found = ALL_SCHEMAS.find((s) => s.experienceMode === mode);
    if (found) {
      setActiveSchema(found);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 font-cairo py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Code size={20} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                مخطط هيكلة القوالب التفاعلية (JSON Template Schema)
              </h1>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              نظام مرن ومفتوح بصيغة JSON يحدد بنية المشاهد، سلاسل الحركات الانتقالية (Animation Sequences)، والحقول المخصصة لكل نمط تجربة (مثل: film-strip vs envelope-reveal).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'تم النسخ!' : 'نسخ Schema JSON'}</span>
            </button>
          </div>
        </div>

        {/* Experience Mode Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            {
              id: 'film-strip' as const,
              label: 'نمط شريط الفيلم 35mm',
              sub: 'film-strip mode',
              icon: Film,
              badge: 'مستوحى من السينما',
            },
            {
              id: 'envelope-reveal' as const,
              label: 'نمط الظرف والختم الشمعي',
              sub: 'envelope-reveal mode',
              icon: Mail,
              badge: 'ملكي فاخر',
            },
            {
              id: 'oriental-lantern' as const,
              label: 'نمط الفانوس الشرقي',
              sub: 'oriental-lantern mode',
              icon: Sparkles,
              badge: 'تراث الحنة',
            },
            {
              id: 'birthday-cake' as const,
              label: 'نمط كيكة عيد الميلاد',
              sub: 'birthday-cake mode',
              icon: Zap,
              badge: 'إطفاء الشموع تفاعلياً',
            },
            {
              id: 'academic-scroll' as const,
              label: 'نمط شهادة التخرج',
              sub: 'academic-scroll mode',
              icon: Layers,
              badge: 'تخصصات جامعية',
            },
            {
              id: 'ribbon-cutting' as const,
              label: 'نمط قص الشريط VIP',
              sub: 'ribbon-cutting mode',
              icon: Sliders,
              badge: 'افتتاح مشاريع',
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={18} className={isSelected ? 'text-amber-400' : 'text-neutral-500'} />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                    {mode.badge}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold leading-snug">{mode.label}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">{mode.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub-tabs: JSON Viewer vs Scenes Definition vs Custom Fields vs Live Test */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveSubTab('schema_json')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'schema_json'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code size={14} />
            <span>كود Schema الكامل (JSON)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('scenes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'scenes'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>تسلسل المشاهد والحركات ({activeSchema.scenes.length} Scenes)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fields')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'fields'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>الحقول المخصصة ({activeSchema.customFields.length} Fields)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'preview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Play size={14} />
            <span>اختبار التجربة الحية (Live Run)</span>
          </button>
        </div>

        {/* Tab Content 1: Raw JSON schema */}
        {activeSubTab === 'schema_json' && (
          <div className="rounded-2xl border border-neutral-800 bg-[#0d0f14] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#13161f] border-b border-neutral-800 text-xs text-neutral-400 font-mono">
              <span>schema-v1.0.0.json · Mode: {activeSchema.experienceMode}</span>
              <span className="text-amber-400 font-bold">{activeSchema.nameEn}</span>
            </div>
            <pre className="p-6 text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed dir-ltr max-h-[600px] selection:bg-amber-500/40">
              <code>{JSON.stringify(activeSchema, null, 2)}</code>
            </pre>
          </div>
        )}

        {/* Tab Content 2: Scenes & Animation Sequences */}
        {activeSubTab === 'scenes' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300">
              يتم تفسير هذه المشاهد بواسطة محرك العرض التفاعلي بالتتابع، مع تفعيل حركات الانتقال والمؤثرات الصوتية في التوقيت المحدد.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSchema.scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">
                      مشهد {scene.sceneIndex + 1}
                    </span>
                    <span className="text-neutral-500 font-mono">{scene.transition}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{scene.title}</h3>
                    <p className="text-[11px] text-neutral-400 font-mono">{scene.titleEn}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-xs text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">نوع المشهد:</span>
                      <span className="font-mono text-amber-300">{scene.sceneType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">المحفز (Trigger):</span>
                      <span className="font-mono text-cyan-300">{scene.animationSequence.trigger}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">المدة والتنعيم:</span>
                      <span className="font-mono text-emerald-300">
                        {scene.animationSequence.durationMs}ms ({scene.animationSequence.easing})
                      </span>
                    </div>
                    {scene.animationSequence.soundEffect && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">المؤثر الصوتي:</span>
                        <span className="font-mono text-pink-300">
                          🔊 {scene.animationSequence.soundEffect}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Custom Fields */}
        {activeSubTab === 'fields' && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">مفتاح الحقل (Field Key)</th>
                    <th className="py-3 px-4 font-semibold">التسمية (العربية / الإنجليزية)</th>
                    <th className="py-3 px-4 font-semibold">النوع (Type)</th>
                    <th className="py-3 px-4 font-semibold">القسم (Section)</th>
                    <th className="py-3 px-4 font-semibold">القيمة الافتراضية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {activeSchema.customFields.map((field) => (
                    <tr key={field.key} className="hover:bg-neutral-800/40">
                      <td className="py-3 px-4 text-amber-300 font-bold">{field.key}</td>
                      <td className="py-3 px-4 font-cairo">
                        <div className="text-white font-medium">{field.label}</div>
                        <div className="text-[11px] text-neutral-500">{field.labelEn}</div>
                      </td>
                      <td className="py-3 px-4 text-cyan-400">{field.type}</td>
                      <td className="py-3 px-4 text-emerald-400">{field.section}</td>
                      <td className="py-3 px-4 text-neutral-300 truncate max-w-xs font-cairo">
                        {String(field.defaultValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 4: Live Run Preview */}
        {activeSubTab === 'preview' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-300">
                تشغيل حي للقالب المبني على المخطط المحدد: <strong>{activeSchema.name}</strong>
              </span>
              <span className="text-amber-400 font-mono">{activeSchema.experienceMode}</span>
            </div>

            <InvitationEngine
              schema={activeSchema}
              data={activeSchema.defaultData}
              isEmbeddedPreview={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
