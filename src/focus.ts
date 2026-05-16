import './focus.css';

interface CheckItem { id: string; text: string; done: boolean; }

export interface Note {
  id: string; type: 'text' | 'checklist';
  title: string; content: string;
  items: CheckItem[]; color: string; emoji: string;
  theme: string;
}

const COLORS = ['#ffd6e0', '#fff3b0', '#c8f7c5', '#b3e5fc', '#e1d5f0', '#ffdfc8'];
const EMOJIS = ['✨', '🌸', '🦋', '🌈', '⭐', '🍀', '🎀', '🌻', '🍓', '🦄', '🧸', '🪷', '🫧', '🍰', '🌙'];

const THEMES = ['rose', 'strawberry', 'unicorn', 'stars', 'garden', 'clouds'];
const THEME_DECOR: Record<string, { tl: string; br: string }> = {
  rose:       { tl: '🌹', br: '🌸' },
  strawberry: { tl: '🍓', br: '🍓' },
  unicorn:    { tl: '🦄', br: '🌈' },
  stars:      { tl: '⭐', br: '💫' },
  garden:     { tl: '🌻', br: '🍀' },
  clouds:     { tl: '☁️', br: '🌟' },
};

const uid = () => Math.random().toString(36).slice(2, 9);
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function loadNotes(): Note[] {
  try {
    const raw: Note[] = JSON.parse(localStorage.getItem('focus-notes') ?? '[]');
    // backfill theme for older notes
    return raw.map(n => ({ ...n, theme: n.theme ?? pick(THEMES) }));
  } catch { return []; }
}

let notes: Note[] = loadNotes();
let selectedId: string | null = null;
let activeSection: 'text' | 'checklist' | null = null;

function save(noteId?: string) {
  localStorage.setItem('focus-notes', JSON.stringify(notes));
  if (!noteId) return;
  const note = notes.find(n => n.id === noteId);
  if (!note) return;
  const t = document.querySelector<HTMLElement>(`.focus-note-item[data-id="${noteId}"] .note-item-title`);
  if (t) t.textContent = note.title || 'Untitled';
  const p = document.querySelector<HTMLElement>(`.focus-note-item[data-id="${noteId}"] .note-item-preview`);
  if (p) p.textContent = note.type === 'text'
    ? note.content.slice(0, 45) + (note.content.length > 45 ? '…' : '')
    : `${note.items.filter(i => i.done).length}/${note.items.length} done`;
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// ─────────────────────────────────────────────
export function initFocus() {
  const app = document.getElementById('focus-app')!;
  app.innerHTML = '';

  const sidebar = document.createElement('div');
  sidebar.id = 'focus-sidebar';
  sidebar.className = 'focus-sidebar';

  const detail = document.createElement('div');
  detail.id = 'focus-detail';
  detail.className = 'focus-detail';

  app.append(sidebar, detail);
  render();
}

function render() { renderSidebar(); renderDetail(); }

// ─── Sidebar ──────────────────────────────────
function renderSidebar() {
  const sidebar = document.getElementById('focus-sidebar')!;
  sidebar.innerHTML = '';

  if (activeSection === null) {
    // Home: two big decorated section boxes
    const title = document.createElement('div');
    title.className = 'sidebar-title';
    title.textContent = '✨ my notes';
    sidebar.appendChild(title);
    sidebar.appendChild(buildSectionBox('text'));
    sidebar.appendChild(buildSectionBox('checklist'));
  } else {
    // Drill-down: back btn + add btn + item list
    const topRow = document.createElement('div');
    topRow.className = 'sidebar-drill-top';

    const backBtn = document.createElement('button');
    backBtn.className = 'sidebar-back-btn';
    backBtn.innerHTML = `← &nbsp;${activeSection === 'text' ? 'Notes' : 'Lists'}`;
    backBtn.onclick = () => { activeSection = null; renderSidebar(); };

    const addBtn = document.createElement('button');
    addBtn.className = 'sidebar-add-btn';
    addBtn.textContent = '+ New';
    addBtn.onclick = () => addNote(activeSection!);

    topRow.append(backBtn, addBtn);
    sidebar.appendChild(topRow);

    const listEl = document.createElement('div');
    listEl.className = 'focus-section-list';

    const filtered = notes.filter(n => n.type === activeSection);
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'section-empty';
      empty.textContent = activeSection === 'text' ? 'No notes yet' : 'No lists yet';
      listEl.appendChild(empty);
    } else {
      filtered.forEach(note => {
        const item = document.createElement('div');
        item.className = 'focus-note-item' + (note.id === selectedId ? ' active' : '');
        item.dataset.id = note.id;
        item.style.setProperty('--item-color', note.color);

        const emojiEl = document.createElement('span');
        emojiEl.className = 'note-item-emoji';
        emojiEl.textContent = note.emoji;

        const info = document.createElement('div');
        info.className = 'note-item-info';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'note-item-title';
        titleSpan.textContent = note.title || 'Untitled';

        const previewSpan = document.createElement('span');
        previewSpan.className = 'note-item-preview';
        previewSpan.textContent = note.type === 'text'
          ? note.content.slice(0, 45) + (note.content.length > 45 ? '…' : '')
          : `${note.items.filter(i => i.done).length}/${note.items.length} done`;

        info.append(titleSpan, previewSpan);
        item.append(emojiEl, info);
        item.onclick = () => { selectedId = selectedId === note.id ? null : note.id; render(); };
        listEl.appendChild(item);
      });
    }
    sidebar.appendChild(listEl);
  }
}

// Decorated section box (like the reference image)
function buildSectionBox(type: 'text' | 'checklist') {
  const isNotes = type === 'text';
  const count = notes.filter(n => n.type === type).length;

  const box = document.createElement('div');
  box.className = `section-box ${isNotes ? 'section-box-notes' : 'section-box-lists'}`;

  // Corner flower decorations
  const tl = document.createElement('span');
  tl.className = 'box-decor box-decor-tl';
  tl.textContent = isNotes ? '🌹' : '🍃';

  const br = document.createElement('span');
  br.className = 'box-decor box-decor-br';
  br.textContent = isNotes ? '🌸' : '🌿';

  const inner = document.createElement('div');
  inner.className = 'section-box-inner';
  inner.innerHTML = `
    <div class="section-box-icon">${isNotes ? '🎀' : '📋'}</div>
    <div class="section-box-title">${isNotes ? 'Notes' : 'Lists'}</div>
    <div class="section-box-count">${count} ${count === 1 ? (isNotes ? 'note' : 'list') : (isNotes ? 'notes' : 'lists')}</div>
  `;

  box.append(tl, br, inner);
  box.onclick = () => { activeSection = type; renderSidebar(); };
  return box;
}

// ─── Add / Delete ──────────────────────────────
function addNote(type: 'text' | 'checklist') {
  const note: Note = {
    id: uid(), type, title: '', content: '',
    items: type === 'checklist' ? [{ id: uid(), text: '', done: false }] : [],
    color: pick(COLORS), emoji: pick(EMOJIS), theme: pick(THEMES),
  };
  notes.unshift(note);
  save();
  selectedId = note.id;
  activeSection = type;
  render();
  requestAnimationFrame(() =>
    document.querySelector<HTMLInputElement>('#focus-detail .note-title')?.focus()
  );
}

function deleteNote(id: string) {
  const deleted = notes.find(n => n.id === id);
  notes = notes.filter(n => n.id !== id);
  save();
  if (selectedId === id) {
    const remaining = notes.filter(n => n.type === deleted?.type);
    selectedId = remaining[0]?.id ?? notes[0]?.id ?? null;
  }
  render();
}

// ─── Detail panel ──────────────────────────────
function renderDetail() {
  const detail = document.getElementById('focus-detail')!;
  detail.innerHTML = '';

  if (!selectedId) {
    detail.innerHTML = `
      <div class="detail-placeholder">
        <span class="detail-placeholder-icon">🌸</span>
        <p>Select a note or list to open it</p>
      </div>`;
    return;
  }

  const note = notes.find(n => n.id === selectedId);
  if (!note) { selectedId = null; renderDetail(); return; }

  // Mobile back button (hidden on desktop via CSS)
  const mobileBack = document.createElement('button');
  mobileBack.className = 'detail-mobile-back';
  mobileBack.innerHTML = `← &nbsp;Back`;
  mobileBack.onclick = () => { selectedId = null; render(); };
  detail.appendChild(mobileBack);

  const wrap = document.createElement('div');
  wrap.className = 'detail-card-wrap';
  wrap.appendChild(buildCard(note));
  detail.appendChild(wrap);
}

// ─── Card builder ──────────────────────────────
function buildCard(note: Note): HTMLElement {
  const card = document.createElement('div');
  card.className = `note-card theme-${note.theme}`;
  card.style.setProperty('--note-color', note.color);
  card.dataset.id = note.id;

  // Corner emoji decorations
  const decor = THEME_DECOR[note.theme] ?? THEME_DECOR['rose'];
  const cornerTL = document.createElement('span');
  cornerTL.className = 'card-corner card-corner-tl';
  cornerTL.textContent = decor.tl;
  const cornerBR = document.createElement('span');
  cornerBR.className = 'card-corner card-corner-br';
  cornerBR.textContent = decor.br;
  card.append(cornerTL, cornerBR);

  const inner = document.createElement('div');
  inner.className = 'note-inner';

  const title = document.createElement('input');
  title.className = 'note-title';
  title.placeholder = 'Title...';
  title.value = note.title;
  title.oninput = () => { note.title = title.value; save(note.id); };
  inner.appendChild(title);

  if (note.type === 'text') {
    const ta = document.createElement('textarea');
    ta.className = 'note-content';
    ta.placeholder = 'Write something cute here... 🌸';
    ta.value = note.content;
    ta.rows = 3;
    ta.oninput = () => { note.content = ta.value; save(note.id); autoResize(ta); };
    inner.appendChild(ta);
    requestAnimationFrame(() => autoResize(ta));
  } else {
    const list = document.createElement('ul');
    list.className = 'checklist';
    inner.appendChild(list);

    const renderItems = () => {
      list.innerHTML = '';
      note.items.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'check-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.className = 'check-cb'; cb.checked = item.done;

        const txt = document.createElement('input');
        txt.type = 'text';
        txt.className = 'check-text' + (item.done ? ' done' : '');
        txt.placeholder = 'to-do...'; txt.value = item.text;

        cb.onchange = () => { item.done = cb.checked; txt.classList.toggle('done', item.done); save(note.id); };
        txt.oninput = () => { item.text = txt.value; save(note.id); };
        txt.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            note.items.splice(idx + 1, 0, { id: uid(), text: '', done: false });
            save(note.id); renderItems();
            list.querySelectorAll<HTMLInputElement>('.check-text')[idx + 1]?.focus();
          } else if (e.key === 'Backspace' && item.text === '' && note.items.length > 1) {
            note.items.splice(idx, 1);
            save(note.id); renderItems();
            list.querySelectorAll<HTMLInputElement>('.check-text')[Math.max(0, idx - 1)]?.focus();
          }
        };

        const del = document.createElement('button');
        del.className = 'check-del'; del.textContent = '×';
        del.onclick = () => {
          if (note.items.length > 1) { note.items.splice(idx, 1); save(note.id); renderItems(); }
        };

        li.append(cb, txt, del);
        list.appendChild(li);
      });

      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-item'; addBtn.textContent = '+ add item';
      addBtn.onclick = () => {
        note.items.push({ id: uid(), text: '', done: false });
        save(note.id); renderItems();
        list.querySelectorAll<HTMLInputElement>('.check-text')[note.items.length - 1]?.focus();
      };
      list.appendChild(addBtn);
    };
    renderItems();
  }

  const footer = document.createElement('div');
  footer.className = 'note-footer';

  const emojiBtn = document.createElement('button');
  emojiBtn.className = 'note-emoji-btn'; emojiBtn.textContent = note.emoji;
  emojiBtn.onclick = () => {
    note.emoji = pick(EMOJIS); emojiBtn.textContent = note.emoji; save(note.id);
    const se = document.querySelector<HTMLElement>(`.focus-note-item[data-id="${note.id}"] .note-item-emoji`);
    if (se) se.textContent = note.emoji;
  };

  const colorRow = document.createElement('div');
  colorRow.className = 'note-colors';
  COLORS.forEach(c => {
    const dot = document.createElement('button');
    dot.className = 'color-dot' + (c === note.color ? ' active' : '');
    dot.style.background = c;
    dot.onclick = () => {
      note.color = c; card.style.setProperty('--note-color', c);
      colorRow.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active'); save(note.id);
      const chip = document.querySelector<HTMLElement>(`.focus-note-item[data-id="${note.id}"]`);
      if (chip) chip.style.setProperty('--item-color', c);
    };
    colorRow.appendChild(dot);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'note-del-btn'; delBtn.textContent = '🗑';
  delBtn.onclick = () => deleteNote(note.id);

  footer.append(emojiBtn, colorRow, delBtn);
  inner.appendChild(footer);
  card.appendChild(inner);
  return card;
}
