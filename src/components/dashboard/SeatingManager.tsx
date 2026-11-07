import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  UserPlus,
  UserMinus,
  Sparkles,
  Printer,
  Search,
  Filter,
} from 'lucide-react';
import { RSVPRecord, SeatingTable, InvitationData } from '../../types/invitation';

interface SeatingManagerProps {
  invitation: InvitationData;
  rsvps: RSVPRecord[];
  tables: SeatingTable[];
  onAddTable: (table: Omit<SeatingTable, 'id'>) => void;
  onDeleteTable: (tableId: string) => void;
  onAssignGuest: (rsvpId: string, tableId: string | undefined) => void;
}

export const SeatingManager: React.FC<SeatingManagerProps> = ({
  invitation,
  rsvps,
  tables,
  onAddTable,
  onDeleteTable,
  onAssignGuest,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableNumber, setNewTableNumber] = useState(tables.length + 1);
  const [newCapacity, setNewCapacity] = useState(8);
  const [newCategory, setNewCategory] = useState<SeatingTable['category']>('general');
  const [newNotes, setNewNotes] = useState('');

  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Filter confirmed guests
  const attendingGuests = rsvps.filter((r) => r.status === 'attending');

  // Filter unassigned
  const unassignedGuests = attendingGuests.filter((r) => !r.assignedTableId);

  // Stats
  const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);
  const totalSeatedGuests = attendingGuests.filter((r) => !!r.assignedTableId).length;

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    onAddTable({
      invitationId: invitation.id,
      tableName: newTableName.trim(),
      tableNumber: Number(newTableNumber),
      capacity: Number(newCapacity),
      category: newCategory,
      notes: newNotes.trim(),
    });

    setNewTableName('');
    setNewTableNumber(tables.length + 2);
    setNewCapacity(8);
    setNewNotes('');
    setShowAddModal(false);
  };

  const handlePrintSeating = () => {
    window.print();
  };

  const filteredTables = tables.filter((t) => {
    if (selectedCategoryFilter === 'all') return true;
    return t.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 font-cairo">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-amber-400" size={22} />
            <span>مخطط وتوزيع الطاولات والجلوس</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {invitation.title}
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            نظم طاولات الحفل بدقة، ووزع ضيوفك حسب العائلات والأصدقاء وVIP، لضمان استقبال استثنائي عند مدخل القاعة.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrintSeating}
            className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Printer size={15} />
            <span>طباعة المخطط للمنظمين</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all"
          >
            <Plus size={16} />
            <span>إضافة طاولة جديدة</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400">إجمالي الطاولات المجهزة</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{tables.length} طاولات</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">سعة إجمالية: {totalSeats} مقعد</div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400">الضيوف الذين تم تسكينهم</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{totalSeatedGuests} ضيف</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            نسبة الإشغال: {totalSeats > 0 ? Math.round((totalSeatedGuests / totalSeats) * 100) : 0}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400">ضيوف بانتظار التوزيع</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{unassignedGuests.length} ضيف</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">من أصل {attendingGuests.length} مؤكد</div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="text-xs text-neutral-400">المقاعد المتبقية الشاغرة</div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
            {Math.max(0, totalSeats - totalSeatedGuests)} مقعد
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">جاهزة لاستيعاب الحضور</div>
        </div>
      </div>

      {/* Main Split: Left Tables Grid, Right Unassigned Guests Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tables Grid (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
              <span className="text-neutral-400 text-xs flex items-center gap-1 px-2">
                <Filter size={13} /> تصفية:
              </span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'vip', label: 'VIP كبار الشخصيات' },
                { id: 'groom_family', label: 'أهل العريس' },
                { id: 'bride_family', label: 'أهل العروس' },
                { id: 'friends', label: 'الأصدقاء' },
                { id: 'colleagues', label: 'الزملاء' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tables Cards Grid */}
          {filteredTables.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <Users size={32} className="text-neutral-500 mx-auto" />
              <div className="text-sm font-bold text-neutral-300">لا توجد طاولات في هذا القسم</div>
              <p className="text-xs text-neutral-500">قم بإضافة طاولة جديدة لتبدأ بتسكين وتوزيع الضيوف عليها.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30"
              >
                إضافة طاولة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTables.map((table) => {
                const seatedInTable = attendingGuests.filter((r) => r.assignedTableId === table.id);
                const isFull = seatedInTable.length >= table.capacity;
                const percentage = Math.min(100, Math.round((seatedInTable.length / table.capacity) * 100));

                return (
                  <div
                    key={table.id}
                    className={`rounded-2xl border transition-all p-4.5 space-y-3.5 ${
                      isFull
                        ? 'bg-neutral-900/90 border-amber-500/40 shadow-[0_0_15px_rgba(212,175,55,0.08)]'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center justify-center font-mono">
                            {table.tableNumber}
                          </span>
                          <h3 className="font-bold text-white text-sm">{table.tableName}</h3>
                        </div>

                        {table.category && (
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                            {table.category === 'vip'
                              ? '⭐ كبار الشخصيات VIP'
                              : table.category === 'groom_family'
                              ? 'عائلة العريس'
                              : table.category === 'bride_family'
                              ? 'عائلة العروس'
                              : table.category === 'colleagues'
                              ? 'زملاء العمل'
                              : table.category === 'friends'
                              ? 'الأصدقاء'
                              : 'عام'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDeleteTable(table.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="حذف الطاولة"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Seat Count */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                        <span>المقاعد المشغولة:</span>
                        <span className={isFull ? 'text-amber-400 font-bold' : 'text-neutral-200'}>
                          {seatedInTable.length} / {table.capacity} مقعد
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull ? 'bg-amber-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Seated Guests List */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-neutral-400 flex items-center justify-between">
                        <span>الضيوف على الطاولة ({seatedInTable.length}):</span>
                        {isFull && <span className="text-[10px] text-amber-400">مكتملة بالكامل</span>}
                      </div>

                      {seatedInTable.length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs">
                          لا يوجد ضيوف مخصصين بعد.
                          <br />
                          اختر ضيفاً من قائمة الانتظار لتسكينه هنا.
                        </div>
                      ) : (
                        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                          {seatedInTable.map((g) => (
                            <div
                              key={g.id}
                              className="flex items-center justify-between text-xs bg-neutral-800/50 hover:bg-neutral-800 px-2.5 py-1.5 rounded-lg border border-neutral-700/50 group"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="text-neutral-200 font-medium truncate">{g.guestName}</span>
                                {g.companionsCount > 0 && (
                                  <span className="text-[10px] text-neutral-400 bg-neutral-700/60 px-1.5 py-0.2 rounded font-mono">
                                    +{g.companionsCount}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => onAssignGuest(g.id, undefined)}
                                className="text-neutral-500 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                                title="إلغاء التسكين وإرجاع الضيف للانتظار"
                              >
                                <UserMinus size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {table.notes && (
                      <div className="text-[11px] text-neutral-500 italic border-t border-neutral-800 pt-2">
                        {table.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Unassigned Guests Shelf */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus size={16} className="text-amber-400" />
                <span>الضيوف بانتظار التوزيع ({unassignedGuests.length})</span>
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="ابحث عن اسم ضيف..."
                value={guestSearchQuery}
                onChange={(e) => setGuestSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* List */}
            {unassignedGuests.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 space-y-2 border border-dashed border-neutral-800 rounded-xl">
                <Check size={24} className="text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-neutral-300">رائع! تم توزيع جميع الضيوف المؤكدين</div>
                <p className="text-[11px] text-neutral-500">كل الحضور لديهم مقاعد مخصصة على الطاولات.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {unassignedGuests
                  .filter((g) => g.guestName.toLowerCase().includes(guestSearchQuery.toLowerCase()))
                  .map((guest) => (
                    <div
                      key={guest.id}
                      className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{guest.guestName}</span>
                        {guest.companionsCount > 0 && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                            مع {guest.companionsCount} مرافق
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-500 font-mono truncate">{guest.phone}</div>

                      {/* Select Table to assign */}
                      <div className="pt-1 flex items-center gap-1.5">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              onAssignGuest(guest.id, e.target.value);
                            }
                          }}
                          defaultValue=""
                          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200 py-1 px-2 focus:outline-none focus:border-amber-500"
                        >
                          <option value="" disabled>
                            اختر طاولة للتعيين...
                          </option>
                          {tables.map((t) => {
                            const count = attendingGuests.filter((r) => r.assignedTableId === t.id).length;
                            const full = count >= t.capacity;
                            return (
                              <option key={t.id} value={t.id} disabled={full}>
                                طاولة {t.tableNumber}: {t.tableName} ({count}/{t.capacity}) {full ? 'مكتملة' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span>إضافة طاولة جديدة في الصالة</span>
            </h3>

            <form onSubmit={handleCreateTable} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">اسم الطاولة أو المسمى</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طاولة كبار الضيوف VIP، أهل العريس، الأصدقاء..."
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-semibold">رقم الطاولة</label>
                  <input
                    type="number"
                    min="1"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-semibold">عدد المقاعد (السعة)</label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">تصنيف الطاولة</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="general">عام / ضيوف الحفل</option>
                  <option value="vip">كبار الشخصيات VIP</option>
                  <option value="groom_family">عائلة أهل العريس</option>
                  <option value="bride_family">عائلة أهل العروس</option>
                  <option value="colleagues">زملاء العمل والمهنة</option>
                  <option value="friends">الأصدقاء المقربون</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">ملاحظات للمنظمين (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: قريبة من المسرح، ضيافة خاصة..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:brightness-110 shadow"
                >
                  إضافة الطاولة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
