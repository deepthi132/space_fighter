import './focus.css';

interface CheckItem { id: string; text: string; done: boolean; }

export interface Note {
  id: string; type: 'text' | 'checklist' | 'study';
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

const isStepNote  = (n: Note) => n.type === 'study' && n.title.startsWith('Step ');
const isDSANote   = (n: Note) => n.type === 'study' && n.title === 'DSA';
const isTopicNote = (n: Note) => n.type === 'study' && n.title.includes(' :: ');

const STEP_SUBITEMS: Record<string, string[]> = {
  'Step 1: Learn the basics':                             ['Time & Space Complexity', 'Basic Math', 'Patterns', 'Recursion Basics', 'Hashing'],
  'Step 2: Learn Important Sorting Techniques':           ['Selection Sort', 'Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Counting Sort'],
  'Step 3: Solve Problems on Arrays':                     ['Easy', 'Medium', 'Hard'],
  'Step 4: Binary Search':                                ['1D Arrays', '2D Arrays', 'In Search Space'],
  'Step 5: Strings':                                      ['Easy', 'Medium', 'Hard'],
  'Step 6: Learn LinkedList':                             ['Single Linked List', 'Doubly Linked List', 'Medium Problems of LL', 'Medium Problems of DLL', 'Hard Problems of LL'],
  'Step 7: Recursion PatternWise':                        ['Get Strong Hold', 'Subsequences Pattern', 'Try Out All Combos'],
  'Step 8: Bit Manipulation':                             ['Learn Bit Manipulation', 'Interview Problems', 'Advanced Maths'],
  'Step 9: Stack and Queues':                             ['Learning', 'Infix, Postfix and Prefix', 'Monotonic Stack and Queue', 'Implementation'],
  'Step 10: Sliding Window & Two Pointer Combined Problems': ['Medium Problems', 'Hard Problems'],
  'Step 11: Heaps':                                       ['Learning', 'Medium Problems', 'Hard Problems'],
  'Step 12: Greedy Algorithms':                           ['Easy', 'Medium'],
  'Step 13: Binary Trees':                                ['Traversals', 'Medium Problems', 'Hard'],
  'Step 14: Binary Search Trees':                         ['Concept', 'Practice Problems'],
  'Step 15: Graphs':                                      ['Learning', 'Traversal Problems', 'Topo Sort Problems', 'Shortest Path Problems', 'MST Problems', 'Other Algorithms'],
  'Step 16: Dynamic Programming':                         ['Intro to DP', '1D DP', '2D DP', 'DP on Subsequences', 'DP on Strings', 'DP on Stocks', 'DP on LIS', 'DP on Partition', 'DP on Squares'],
  'Step 17: Tries/Theory':                                ['Theory', 'Problems'],
};

const TOPIC_SUBITEMS: Record<string, string[]> = {
  // Arrays
  'Step 3: Solve Problems on Arrays :: Easy': ['Largest element in array','Second largest element in array','Check if array is sorted and rotated','Remove duplicates from sorted array','Rotate array left by 1 place','Rotate array by k places',"Move 0's to end",'Linear search','Union of 2 sorted arrays','Missing number','Max consecutive 1s','Longest subarray with given sum','Find element present only once'],
  'Step 3: Solve Problems on Arrays :: Medium': ['2 sum problem','Sort 0 1 2','Majority element',"Kadane's algorithm",'Number of subarrays with sum k','Stock buy sell','Rearrange elements by sign','Next permutation','Leaders in array','Longest consecutive subsequence',"Set matrix 0's",'Rotate matrix','Spiral traversal'],
  'Step 3: Solve Problems on Arrays :: Hard': ['Pascal triangle','Majority element 2','3 sum','4 sum','Largest subarray with 0 sum','Subarrays with XOR k','Merge overlapping subintervals','Merge 2 sorted arrays without space','Repeating and missing numbers','Count inversions','Reverse pairs','Maximum product subarray','Longest subarray with sum k (+ve and -ve)'],
  // Binary Search
  'Step 4: Binary Search :: 1D Arrays': ['Find x in sorted array','Implement lower bound','Implement upper bound','Search insert position','Check if array is sorted','First and last position','Number of occurrences','Find peak element','Search in rotated sorted array','Search in rotated sorted array with duplicates','Find minimum element in rotated sorted array','Find single element in sorted array','How many times array is rotated'],
  'Step 4: Binary Search :: 2D Arrays': ['Row with maximum number of 1s','Search in sorted matrix','Search in rowwise sorted matrix','Peak element in matrix','Matrix median'],
  'Step 4: Binary Search :: In Search Space': ['Square root of number','Nth root of integer','Koko eating bananas','Minimum days to make bouquets','Find smallest integer','Capacity to ship packages','Aggressive cows','Book allocation','Split array largest sum','Kth missing number','Gas station','Median of two sorted arrays','Kth element of two sorted arrays'],
  // Strings
  'Step 5: Strings :: Easy': ['Remove outer parenthesis','Reverse words in string','Largest odd number in string','Longest common prefix','Isomorphic string','Check for rotated string','Valid anagram'],
  'Step 5: Strings :: Medium': ['Sort characters by frequency','Max nesting depth of parenthesis','Roman to integer','Implement atoi','Count substrings with k unique characters','Longest palindromic substring','Sum of beauty of all substrings'],
  'Step 5: Strings :: Hard': ['Minimum insertions to make parenthesis valid','Count and Say','KMP / Z string matching algorithm','Longest happy prefix','Shortest palindrome'],
  // Linked List
  'Step 6: Learn LinkedList :: Single Linked List': ['Intro to linked list','Insert node to linked list','Delete node in linked list','Count the number of nodes','Search element in linked list'],
  'Step 6: Learn LinkedList :: Doubly Linked List': ['Introduction to Double LL','Insert node in DLL','Delete node in DLL','Reverse DLL'],
  'Step 6: Learn LinkedList :: Medium Problems of LL': ['Find mid of LL','Reverse LL','Detect loop in LL','Start of cycle in LL','Count nodes in loop','Check for palindrome LL','Odd even LL','Delete nth node from back','Delete mid of LL','Sort LL','Sort 0 1 2 in LL','Add 1 to LL','Add two LL'],
  'Step 6: Learn LinkedList :: Medium Problems of DLL': ['Delete nodes from DLL','Pair sum in DLL','Remove duplicates from DLL'],
  'Step 6: Learn LinkedList :: Hard Problems of LL': ['Reverse k nodes in groups','Rotate LL k times','Copy LL with random pointers','Flatten LL'],
  // Recursion
  'Step 7: Recursion PatternWise :: Get Strong Hold': ['Implement atoi via recursion','Count good numbers','Reverse stack using recursion','Sort stack using recursion'],
  'Step 7: Recursion PatternWise :: Subsequences Pattern': ['Generate all valid parenthesis','Power set','Count distinct substrings','Count subsets with sum equal to k','Subset 1','Subset 2','Combination Sum 1','Combination Sum 2','Combination Sum 3','Letter combinations of phone'],
  'Step 7: Recursion PatternWise :: Try Out All Combos': ['Palindrome partitioning','Word search in grid','Rat in maze','M coloring problem','N queens','Word Break','Sudoku solver'],
  // Bit Manipulation
  'Step 8: Bit Manipulation :: Learn Bit Manipulation': ['Bit manipulation basics','Check for the ith bit','Check for odd / even','Check for power of 2','Set the rightmost unset bit','Swap two numbers without temporary variable','Divide two numbers using bit manipulation','Count set bits from 1 to n'],
  'Step 8: Bit Manipulation :: Interview Problems': ['Minimum bit flips','Exceptionally odd','XOR of numbers from L to R'],
  'Step 8: Bit Manipulation :: Advanced Maths': ['Prime factors of number','All divisors of number','Sieve of Eratosthenes','Prime factorization using Sieve','Fast Power'],
  // Stack and Queues
  'Step 9: Stack and Queues :: Learning': ['Implement stack using array','Implement queue using array','Implement stack using queue','Implement queue using stacks','Implement stack using linked list','Valid parenthesis','Implement min stack'],
  'Step 9: Stack and Queues :: Infix, Postfix and Prefix': ['Infix to postfix','Infix to prefix','Prefix to infix','Prefix to postfix','Postfix to infix','Postfix to prefix'],
  'Step 9: Stack and Queues :: Monotonic Stack and Queue': ['Next Greater Element','Next Greater Element 2','Previous Smaller Element','Trapping Rainwater','Sum of subarray minimum','Sum of range of all subarrays','Remove K elements','Largest Rectangle in Histogram','Maximal Rectangle in binary matrix','Asteroids Collision'],
  'Step 9: Stack and Queues :: Implementation': ['Sliding window maximum','Stock span problem','Celebrity Problem','LRU Cache'],
  // Sliding Window
  'Step 10: Sliding Window & Two Pointer Combined Problems :: Medium Problems': ['Longest Substring Without Repeating Characters','Max Consecutive 1s','Fruit into Baskets','Longest Repeating Character','Binary Subarrays with Sum','Count the number of nice subarrays','Number of Substrings Containing all 3 characters','Maximum Points you can obtain from the card'],
  'Step 10: Sliding Window & Two Pointer Combined Problems :: Hard Problems': ['Longest Substring with at most K unique characters','Count substrings with exactly K unique characters','Minimum Window Substring'],
  // Heaps
  'Step 11: Heaps :: Learning': ['Implement min heap','Check if array is heap','Convert min heap to max heap'],
  'Step 11: Heaps :: Medium Problems': ['Kth largest element','Kth smallest element','Merge K sorted arrays','Merge K sorted Lists','Arrange by rank','Task Scheduler','Divide array into sets of K consecutive numbers'],
  'Step 11: Heaps :: Hard Problems': ['Design Twitter','Minimum Cost to join n ropes','Kth largest element in stream','Maximum K sum combinations','Median in a stream','Top K frequent elements'],
  // Greedy
  'Step 12: Greedy Algorithms :: Easy': ['Assign Cookies','Fractional Knapsack','Lemonade Exchange','Valid Parenthesis String'],
  'Step 12: Greedy Algorithms :: Medium': ['N Meetings in one room','Jump Game','Jump Game 2','Minimum Platforms','Job Sequencing Problem','Candy','Insert Interval','Non Overlapping Intervals'],
  // Binary Trees
  'Step 13: Binary Trees :: Traversals': ['Introduction to trees','Binary Tree representation','Preorder Traversal','Inorder Traversal','Postorder Traversal','Level Order Traversal','Iterative Preorder Traversal','Iterative Inorder Traversal','Iterative Postorder Traversal','All in one traversal'],
  'Step 13: Binary Trees :: Medium Problems': ['Height of binary tree','Balanced Binary Tree','Diameter of Binary Tree','Maximum Path Sum','Same Tree','Zig-Zag Traversal','Boundary Traversal','Vertical Order Traversal','Top View','Bottom View','Left / Right View','Symmetric Tree'],
  'Step 13: Binary Trees :: Hard': ['All root to leaf paths','Lowest Common Ancestor','Max width of binary tree','Check children sum property','All nodes at distance K','Min time to burn binary tree','Count nodes in complete binary tree','Construct BT from inorder and preorder','Construct BT from inorder and postorder','Morris Preorder Traversal','Morris Inorder Traversal','Flatten Binary Tree','Serialize and Deserialize'],
  // BST
  'Step 14: Binary Search Trees :: Concept': ['Intro to BST','Search in BST','Minimum value in BST'],
  'Step 14: Binary Search Trees :: Practice Problems': ['Ceil in BST','Floor in BST','Insert into BST','Delete from BST','Kth smallest element in BST','Validate BST','LCA in BST','Build BST from Preorder Traversal','BST Iterator','Two Sum in BST','Recover BST','Largest BST in Binary Tree'],
  // Graphs
  'Step 15: Graphs :: Learning': ['Count the number of graphs','Graph Representation','BFS','DFS'],
  'Step 15: Graphs :: Traversal Problems': ['Count the number of provinces','Rotten Oranges','Flood-Fill Algorithm','Detect Cycle in Undirected Graph','01 Matrix','Surrounded Regions','Number of Enclaves','Word Ladder','Distinct Islands','Bipartite Graph','Detect Cycle in Directed Graph'],
  'Step 15: Graphs :: Topo Sort Problems': ['Topological Sorting',"Kahn's Algorithm",'Course Scheduler 1','Course Scheduler 2','Find Eventual Safe State','Alien Dictionary'],
  'Step 15: Graphs :: Shortest Path Problems': ['Shortest path in Undirected Graph (unit distance)','Shortest path in DAG',"Dijkstra's Algorithm",'Shortest Path in binary matrix','Path with minimum effort','Cheapest Flights with K stops','Network Delay Time','Bellman Ford Algorithm','Floyd Warshall Algorithm','Find city with smallest number of neighbours','Number of ways to arrive at destination'],
  'Step 15: Graphs :: MST Problems': ["Prim's Algorithm","Kruskal's Algorithm",'Number of Operations to make Network Connected','Most stones removed','Account Merge','Number of islands 2','Making Large Island','Swim in rising water'],
  'Step 15: Graphs :: Other Algorithms': ['Bridges in graph','Strongly Connected Components'],
  // Dynamic Programming
  'Step 16: Dynamic Programming :: Intro to DP': ['Find the nth Fibonacci number'],
  'Step 16: Dynamic Programming :: 1D DP': ['Climbing Stairs','Frog Jump','Frog K Jumps','House Robber','House Robber 2'],
  'Step 16: Dynamic Programming :: 2D DP': ['Ninja Training','Unique Paths','Unique Paths 2','Minimum Path Sum','Minimum Path in Triangle','Minimum Falling Path Sum'],
  'Step 16: Dynamic Programming :: DP on Subsequences': ['Subset sum equal to k','Partition array in two equal sum subsets','Minimum Sum Partition','Count number of subsets with sum K','Partition with given difference','0/1 Knapsack','Coin Change','Target Sum','Coin Change 2','Unbounded Knapsack','Rod Cutting Problem'],
  'Step 16: Dynamic Programming :: DP on Strings': ['Longest Common Subsequence','Print the LCS','Longest Common Substring','Longest Palindromic Subsequence','Minimum steps to make string palindrome','Minimum steps to make other string','Shortest Common Supersequence','Distinct Subsequences','Wildcard Matching'],
  'Step 16: Dynamic Programming :: DP on Stocks': ['Best time to buy and sell stocks','Best time to buy and sell stock 2','Best time to buy and sell stock (up to 2 transactions)','Best time to buy and sell stock (up to k transactions)','Buy and sell stocks with cooldown','Buy and sell stocks with transaction fee'],
  'Step 16: Dynamic Programming :: DP on LIS': ['Longest Increasing Subsequence','Print LIS','Largest Divisible Subset','Longest Bitonic Subsequence','Number of LIS'],
  'Step 16: Dynamic Programming :: DP on Partition': ['Matrix Chain Multiplication','Minimum cost to cut stick','Burst Balloons','Palindrome Partitioning 2','Partition array for maximum sum'],
  'Step 16: Dynamic Programming :: DP on Squares': ['Maximal Square','Count square submatrices'],
  // Tries
  'Step 17: Tries/Theory :: Theory': ['Implement Trie (Prefix Tree)'],
  'Step 17: Tries/Theory :: Problems': ['Implement Trie 2','Complete String','Count distinct substrings','Bitwise basic operations','Maximum XOR of two numbers'],
};

const DSA_STEPS = [
  'Step 1: Learn the basics',
  'Step 2: Learn Important Sorting Techniques',
  'Step 3: Solve Problems on Arrays',
  'Step 4: Binary Search',
  'Step 5: Strings',
  'Step 6: Learn LinkedList',
  'Step 7: Recursion PatternWise',
  'Step 8: Bit Manipulation',
  'Step 9: Stack and Queues',
  'Step 10: Sliding Window & Two Pointer Combined Problems',
  'Step 11: Heaps',
  'Step 12: Greedy Algorithms',
  'Step 13: Binary Trees',
  'Step 14: Binary Search Trees',
  'Step 15: Graphs',
  'Step 16: Dynamic Programming',
  'Step 17: Tries/Theory',
];

function loadNotes(): Note[] {
  try {
    const raw: Note[] = JSON.parse(localStorage.getItem('focus-notes') ?? '[]');
    const notes = raw.map(n => ({ ...n, theme: n.theme ?? pick(THEMES) }));
    // seed DSA and LLD
    if (!notes.some(n => n.type === 'study' && !isStepNote(n))) {
      notes.push(
        { id: uid(), type: 'study', title: 'DSA', content: '', items: [], color: '#b3e5fc', emoji: '📊', theme: 'stars' },
        { id: uid(), type: 'study', title: 'LLD', content: '', items: [], color: '#e1d5f0', emoji: '📐', theme: 'unicorn' },
      );
    }
    // seed/backfill DSA checklist (17 step names as checkable items)
    const dsa = notes.find(isDSANote);
    if (dsa && dsa.items.length === 0) {
      dsa.items = DSA_STEPS.map(t => ({ id: uid(), text: t, done: false }));
    }
    // seed step notes (hidden from sidebar, hold sub-items per step)
    if (!notes.some(isStepNote)) {
      for (const step of DSA_STEPS) {
        notes.push({
          id: uid(), type: 'study', title: step, content: '',
          items: (STEP_SUBITEMS[step] ?? []).map(t => ({ id: uid(), text: t, done: false })),
          color: '#b3e5fc', emoji: '📖', theme: 'stars',
        });
      }
    }
    // backfill sub-items for existing step notes with no items
    for (const n of notes.filter(isStepNote)) {
      if (n.items.length === 0 && STEP_SUBITEMS[n.title]) {
        n.items = STEP_SUBITEMS[n.title].map(t => ({ id: uid(), text: t, done: false }));
      }
    }
    // seed topic notes (individual problems within each sub-topic)
    for (const step of notes.filter(isStepNote)) {
      for (const item of step.items) {
        const topicTitle = `${step.title} :: ${item.text}`;
        if (TOPIC_SUBITEMS[topicTitle] && !notes.some(n => n.title === topicTitle)) {
          notes.push({
            id: uid(), type: 'study', title: topicTitle, content: '',
            items: TOPIC_SUBITEMS[topicTitle].map(t => ({ id: uid(), text: t, done: false })),
            color: '#c8f7c5', emoji: '📝', theme: 'garden',
          });
        }
      }
    }
    localStorage.setItem('focus-notes', JSON.stringify(notes));
    return notes;
  } catch { return []; }
}

let notes: Note[] = loadNotes();
let selectedId: string | null = null;
let activeSection: 'text' | 'checklist' | 'study' | null = null;
let viewingStepId: string | null = null;  // step note being viewed inside DSA card
let viewingTopicId: string | null = null; // topic note being viewed inside a step card

function save(noteId?: string) {
  localStorage.setItem('focus-notes', JSON.stringify(notes));
  if (!noteId) return;
  const note = notes.find(n => n.id === noteId);
  if (!note) return;
  const t = document.querySelector<HTMLElement>(`.focus-note-item[data-id="${noteId}"] .note-item-title`);
  if (t) t.textContent = note.title || 'Untitled';
  const p = document.querySelector<HTMLElement>(`.focus-note-item[data-id="${noteId}"] .note-item-preview`);
  if (p) p.textContent = (note.type === 'text' || (note.type === 'study' && note.items.length === 0))
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
    // Normal section drill-down: back btn + add btn + item list
    const topRow = document.createElement('div');
    topRow.className = 'sidebar-drill-top';

    const backBtn = document.createElement('button');
    backBtn.className = 'sidebar-back-btn';
    const sectionLabel: Record<string, string> = { text: 'Notes', checklist: 'Lists', study: 'Study' };
    backBtn.innerHTML = `← &nbsp;${sectionLabel[activeSection!]}`;
    backBtn.onclick = () => { activeSection = null; renderSidebar(); };

    topRow.append(backBtn);

    if (activeSection !== 'study') {
      const addBtn = document.createElement('button');
      addBtn.className = 'sidebar-add-btn';
      addBtn.textContent = '+ New';
      addBtn.onclick = () => addNote(activeSection!);
      topRow.append(addBtn);
    }
    sidebar.appendChild(topRow);

    const listEl = document.createElement('div');
    listEl.className = 'focus-section-list';

    // For study: only show DSA and LLD (not the step notes)
    const filtered = notes.filter(n =>
      n.type === activeSection && !isStepNote(n)
    );

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'section-empty';
      empty.textContent = activeSection === 'text' ? 'No notes yet' : activeSection === 'checklist' ? 'No lists yet' : 'No items yet';
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
        previewSpan.textContent = (note.type === 'text' || (note.type === 'study' && note.items.length === 0))
          ? note.content.slice(0, 45) + (note.content.length > 45 ? '…' : '')
          : `${note.items.filter(i => i.done).length}/${note.items.length} done`;

        info.append(titleSpan, previewSpan);
        item.append(emojiEl, info);

        item.onclick = () => {
          selectedId = selectedId === note.id ? null : note.id;
          if (!isDSANote(note)) { viewingStepId = null; viewingTopicId = null; }
          render();
        };

        listEl.appendChild(item);
      });
    }
    sidebar.appendChild(listEl);
  }
}

// Decorated section box (like the reference image)
function buildSectionBox(type: 'text' | 'checklist' | 'study') {
  const CFG = {
    text:      { cls: 'section-box-notes', tl: '🌹', br: '🌸', icon: '🎀', label: 'Notes', unit: ['note',  'notes'] },
    checklist: { cls: 'section-box-lists', tl: '🍃', br: '🌿', icon: '📋', label: 'Lists', unit: ['list',  'lists'] },
    study:     { cls: 'section-box-study', tl: '📚', br: '✏️', icon: '🎓', label: 'Study', unit: ['item',  'items'] },
  }[type];

  const count = notes.filter(n => n.type === type && !isStepNote(n)).length;

  const box = document.createElement('div');
  box.className = `section-box ${CFG.cls}`;

  const tl = document.createElement('span');
  tl.className = 'box-decor box-decor-tl';
  tl.textContent = CFG.tl;

  const br = document.createElement('span');
  br.className = 'box-decor box-decor-br';
  br.textContent = CFG.br;

  const inner = document.createElement('div');
  inner.className = 'section-box-inner';
  inner.innerHTML = `
    <div class="section-box-icon">${CFG.icon}</div>
    <div class="section-box-title">${CFG.label}</div>
    <div class="section-box-count">${count} ${count === 1 ? CFG.unit[0] : CFG.unit[1]}</div>
  `;

  box.append(tl, br, inner);
  box.onclick = () => { activeSection = type; renderSidebar(); };
  return box;
}

// ─── Add / Delete ──────────────────────────────
function addNote(type: 'text' | 'checklist' | 'study') {
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

  // If drilling into a step or topic from the DSA card
  if (viewingStepId && isDSANote(note)) {
    if (viewingTopicId) {
      const topic = notes.find(n => n.id === viewingTopicId);
      if (topic) { renderTopicItems(detail, topic); return; }
      viewingTopicId = null;
    }
    const step = notes.find(n => n.id === viewingStepId);
    if (step) { renderStepSubItems(detail, step); return; }
    viewingStepId = null;
  }

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

function renderStepSubItems(detail: HTMLElement, step: Note) {
  const backBtn = document.createElement('button');
  backBtn.className = 'step-sub-back-btn';
  backBtn.innerHTML = `← &nbsp;Back to DSA`;
  backBtn.onclick = () => { viewingStepId = null; viewingTopicId = null; renderDetail(); };
  detail.appendChild(backBtn);

  const wrap = document.createElement('div');
  wrap.className = 'detail-card-wrap';
  wrap.appendChild(buildCard(step));
  detail.appendChild(wrap);
}

function renderTopicItems(detail: HTMLElement, topic: Note) {
  const backBtn = document.createElement('button');
  backBtn.className = 'step-sub-back-btn';
  // show just the sub-topic name (after ' :: ') in the back label
  const stepLabel = topic.title.split(' :: ')[0];
  backBtn.innerHTML = `← &nbsp;Back to ${stepLabel}`;
  backBtn.onclick = () => { viewingTopicId = null; renderDetail(); };
  detail.appendChild(backBtn);

  const wrap = document.createElement('div');
  wrap.className = 'detail-card-wrap';
  wrap.appendChild(buildCard(topic));
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

  if (note.type === 'text' || (note.type === 'study' && note.items.length === 0)) {
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

    const isDSA  = isDSANote(note);
    const isStep = isStepNote(note);
    const locked = isDSA || isStep; // items are read-only; nav handled by › button

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
        txt.readOnly = locked;
        if (!locked) {
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
        }

        if (isDSA) {
          // Navigate into step's sub-items
          const navBtn = document.createElement('button');
          navBtn.className = 'check-nav'; navBtn.textContent = '›';
          navBtn.onclick = () => {
            const stepNote = notes.find(n => isStepNote(n) && n.title === item.text);
            if (stepNote) { viewingStepId = stepNote.id; renderDetail(); }
          };
          li.append(cb, txt, navBtn);
        } else if (isStep) {
          // Navigate into topic's individual problems (if topic note exists)
          const topicTitle = `${note.title} :: ${item.text}`;
          const topicNote = notes.find(n => n.title === topicTitle && isTopicNote(n));
          if (topicNote) {
            const navBtn = document.createElement('button');
            navBtn.className = 'check-nav'; navBtn.textContent = '›';
            navBtn.onclick = () => { viewingTopicId = topicNote.id; renderDetail(); };
            li.append(cb, txt, navBtn);
          } else {
            li.append(cb, txt);
          }
        } else {
          const del = document.createElement('button');
          del.className = 'check-del'; del.textContent = '×';
          del.onclick = () => {
            if (note.items.length > 1) { note.items.splice(idx, 1); save(note.id); renderItems(); }
          };
          li.append(cb, txt, del);
        }
        list.appendChild(li);
      });

      if (!locked) {
        const addBtn = document.createElement('button');
        addBtn.className = 'btn-add-item'; addBtn.textContent = '+ add item';
        addBtn.onclick = () => {
          note.items.push({ id: uid(), text: '', done: false });
          save(note.id); renderItems();
          list.querySelectorAll<HTMLInputElement>('.check-text')[note.items.length - 1]?.focus();
        };
        list.appendChild(addBtn);
      }
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

  footer.append(emojiBtn, colorRow);

  if (note.type !== 'study') {
    const delBtn = document.createElement('button');
    delBtn.className = 'note-del-btn'; delBtn.textContent = '🗑';
    delBtn.onclick = () => deleteNote(note.id);
    footer.append(delBtn);
  }
  inner.appendChild(footer);
  card.appendChild(inner);
  return card;
}
