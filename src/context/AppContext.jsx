import { createContext, useContext, useReducer, useEffect } from 'react';

export const AppContext = createContext(null);
export const AppDispatchContext = createContext(null);

// Storage key
const STORAGE_KEY = 'shura-pro-data';

// Initial state
const initialState = {
  profile: {
    team: '',
    tags: [],
  },
  
  // Heat Point module
  heatPoints: {
    totalPoints: 0,
    todayPoints: 0,
    sessions: [],
    streak: 0,
    lastActiveDate: new Date().toDateString(),
  },

  // Shura Canvas — hierarchical: Canvas (To-be/As-is/Gap) → Hypotheses[]
  canvases: [],

  // Commitments / Objective KPI
  commitments: {
    milestones: [],
    weeklyGoals: {
      targetHours: 15,
      actualHours: 0,
    },
    velocityHistory: [3, 5, 2, 4, 6, 3, 4], // last 7 weeks mock
  },

  // Calendar Events
  calendarEvents: [],

  // Activity log (for community feed)
  activityLog: [],

  // 3-axis Growth Logs (Decision, Feedback, Insight)
  growthLogs: [],

  // Inbox Memos (Flash freezing of emotions)
  inboxMemos: [],

  // Toast notifications
  toasts: [],

  // Celebration state
  celebration: null,
};

// Load from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: convert old flat hypotheses[] to canvases[] if needed
      if (parsed.hypotheses && !parsed.canvases) {
        parsed.canvases = [];
        parsed.hypotheses = undefined;
      }
      // Migration: add history array to canvases if missing
      if (parsed.canvases) {
        parsed.canvases = parsed.canvases.map(c => ({
          ...c,
          history: c.history || []
        }));
      }

      // Daily reset logic for heat points
      const todayStr = new Date().toDateString();
      if (parsed.heatPoints) {
        if (parsed.heatPoints.lastActiveDate !== todayStr) {
          parsed.heatPoints.todayPoints = 0;
          parsed.heatPoints.lastActiveDate = todayStr;
        }
      }

      return { ...initialState, ...parsed, toasts: [], celebration: null };
    }
  } catch (e) {
    console.warn('Failed to load saved state:', e);
  }
  return initialState;
}

// Save to localStorage
function saveState(state) {
  try {
    const { toasts, celebration, ...persistable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

// Helper: get all hypotheses across all canvases (flat list)
export function getAllHypotheses(canvases) {
  return canvases.flatMap((c) => c.hypotheses || []);
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    // ===== Sync =====
    case 'HYDRATE_FROM_REMOTE': {
      const { profile, lastUpdated, ...remoteState } = action.payload;
      return {
        ...state,
        ...remoteState,
        profile: { ...state.profile, ...profile }
      };
    }

    case 'UPDATE_PROFILE': {
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload
        }
      };
    }

    // ===== Heat Points =====
    case 'RECORD_HEAT_SESSION': {
      const now = new Date();
      const todayStr = now.toDateString();
      let currentTodayPoints = state.heatPoints.todayPoints;
      
      // Reset if crossing midnight while app is open
      if (state.heatPoints.lastActiveDate !== todayStr) {
        currentTodayPoints = 0;
      }

      const { points, description, mode, unit, amount, hurdle, duration } = action.payload;
      const session = {
        id: Date.now().toString(),
        points,
        description,
        mode,
        unit,
        amount,
        hurdle,
        duration,
        timestamp: now.toISOString(),
      };
      const newTotal = state.heatPoints.totalPoints + points;
      const newToday = currentTodayPoints + points;

      // Add to activity log
      const logEntry = {
        id: Date.now().toString(),
        type: 'heat_record',
        message: `${points}pt 獲得！ — ${description || mode}`,
        timestamp: new Date().toISOString(),
        user: 'あなた',
      };

      return {
        ...state,
        heatPoints: {
          ...state.heatPoints,
          totalPoints: newTotal,
          todayPoints: newToday,
          lastActiveDate: todayStr,
          sessions: [session, ...state.heatPoints.sessions].slice(0, 100),
        },
        activityLog: [logEntry, ...state.activityLog].slice(0, 200),
      };
    }

    case 'RESET_DAILY_POINTS':
      return {
        ...state,
        heatPoints: { 
          ...state.heatPoints, 
          todayPoints: 0,
          lastActiveDate: new Date().toDateString(),
        },
      };

    // ===== Canvases (To-be / As-is / Gap containers) =====
    case 'ADD_CANVAS': {
      const canvas = {
        id: Date.now().toString(),
        tobe: '',
        asis: '',
        gap: '',
        hypotheses: [],
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...action.payload,
      };
      return {
        ...state,
        canvases: [canvas, ...state.canvases],
      };
    }

    case 'UPDATE_CANVAS': {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        canvases: state.canvases.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        ),
      };
    }

    case 'DELETE_CANVAS':
      return {
        ...state,
        canvases: state.canvases.filter((c) => c.id !== action.payload),
      };

    case 'PIVOT_CANVAS': {
      const { canvasId, reason } = action.payload;
      let newLog = state.activityLog;
      
      const updatedCanvases = state.canvases.map((c) => {
        if (c.id !== canvasId) return c;
        
        const snapshot = {
          id: Date.now().toString(),
          tobe: c.tobe,
          asis: c.asis,
          gap: c.gap,
          reason: reason || '',
          timestamp: new Date().toISOString()
        };

        const logEntry = {
          id: Date.now().toString(),
          type: 'canvas_pivot',
          message: `テーマ「${c.gap || c.tobe || '名称未設定'}」をピボットしました`,
          timestamp: new Date().toISOString(),
          user: 'あなた',
        };
        newLog = [logEntry, ...state.activityLog].slice(0, 200);

        return {
          ...c,
          history: [snapshot, ...(c.history || [])],
          updatedAt: new Date().toISOString()
        };
      });

      return {
        ...state,
        canvases: updatedCanvases,
        activityLog: newLog,
      };
    }

    // ===== Hypotheses (nested within a canvas) =====
    case 'ADD_HYPOTHESIS': {
      const { canvasId, ...hypothesisData } = action.payload;
      const hypothesis = {
        id: Date.now().toString(),
        status: 'unverified',
        hypothesis: '',
        verificationMethod: '',
        judgmentCriteria: '',
        learnings: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...hypothesisData,
      };
      return {
        ...state,
        canvases: state.canvases.map((c) =>
          c.id === canvasId
            ? { ...c, hypotheses: [hypothesis, ...c.hypotheses], updatedAt: new Date().toISOString() }
            : c
        ),
      };
    }

    case 'UPDATE_HYPOTHESIS': {
      const { canvasId, hypothesisId, ...updates } = action.payload;

      let newLog = state.activityLog;

      const updatedCanvases = state.canvases.map((c) => {
        if (c.id !== canvasId) return c;
        const updatedHypotheses = c.hypotheses.map((h) => {
          if (h.id !== hypothesisId) return h;

          // Log status changes
          if (updates.status && h.status !== updates.status) {
            const statusLabels = { unverified: '未検証', verifying: '検証中', completed: '完了' };
            const logEntry = {
              id: Date.now().toString(),
              type: 'hypothesis_update',
              message: `仮説のステータスを「${statusLabels[updates.status]}」に変更`,
              timestamp: new Date().toISOString(),
              user: 'あなた',
            };
            newLog = [logEntry, ...state.activityLog].slice(0, 200);
          }

          return { ...h, ...updates, updatedAt: new Date().toISOString() };
        });
        return { ...c, hypotheses: updatedHypotheses, updatedAt: new Date().toISOString() };
      });

      return {
        ...state,
        canvases: updatedCanvases,
        activityLog: newLog,
      };
    }

    case 'DELETE_HYPOTHESIS': {
      const { canvasId, hypothesisId } = action.payload;
      return {
        ...state,
        canvases: state.canvases.map((c) =>
          c.id === canvasId
            ? { ...c, hypotheses: c.hypotheses.filter((h) => h.id !== hypothesisId), updatedAt: new Date().toISOString() }
            : c
        ),
      };
    }

    // ===== Commitments =====
    case 'UPDATE_WEEKLY_GOAL':
      return {
        ...state,
        commitments: {
          ...state.commitments,
          weeklyGoals: { ...state.commitments.weeklyGoals, ...action.payload },
        },
      };

    case 'ADD_MILESTONE': {
      const milestone = {
        id: Date.now().toString(),
        title: '',
        completed: false,
        category: 'shura', // 'shura' | 'other'
        ...action.payload,
      };
      return {
        ...state,
        commitments: {
          ...state.commitments,
          milestones: [...state.commitments.milestones, milestone],
        },
      };
    }

    case 'IMPORT_MILESTONES': {
      const newMilestones = action.payload.map((title, index) => ({
        id: (Date.now() + index).toString(),
        title,
        completed: false,
      }));
      return {
        ...state,
        commitments: {
          ...state.commitments,
          milestones: [...state.commitments.milestones, ...newMilestones],
        },
      };
    }

    case 'TOGGLE_MILESTONE': {
      const milestones = state.commitments.milestones.map((m) =>
        m.id === action.payload ? { ...m, completed: !m.completed } : m
      );
      return {
        ...state,
        commitments: { ...state.commitments, milestones },
      };
    }

    case 'DELETE_MILESTONE': {
      return {
        ...state,
        commitments: {
          ...state.commitments,
          milestones: state.commitments.milestones.filter((m) => m.id !== action.payload),
        },
      };
    }

    case 'LOG_COMMIT_HOURS': {
      return {
        ...state,
        commitments: {
          ...state.commitments,
          weeklyGoals: {
            ...state.commitments.weeklyGoals,
            actualHours: state.commitments.weeklyGoals.actualHours + action.payload,
          },
        },
      };
    }

    // ===== Growth Logs (3-axis) =====
    case 'ADD_GROWTH_LOG': {
      const { category, message, partner } = action.payload;
      const newLog = {
        id: Date.now().toString(),
        category, // 'decision' | 'feedback' | 'insight'
        message,
        partner: partner || '',
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        growthLogs: [newLog, ...(state.growthLogs || [])],
      };
    }

    // ===== Inbox Memos =====
    case 'ADD_INBOX_MEMO': {
      const newMemo = {
        id: Date.now().toString(),
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        status: 'unprocessed',
      };
      return {
        ...state,
        inboxMemos: [newMemo, ...(state.inboxMemos || [])],
      };
    }

    case 'REMOVE_INBOX_MEMO':
      return {
        ...state,
        inboxMemos: (state.inboxMemos || []).filter((m) => m.id !== action.payload),
      };

    // ===== Calendar Events =====
    case 'ADD_CALENDAR_EVENT': {
      const event = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
        category: action.payload.eventType === 'task' ? 'shura' : 'other', // Default to shura for tasks
        ...action.payload,
      };
      return {
        ...state,
        calendarEvents: [...(state.calendarEvents || []), event],
      };
    }

    case 'TOGGLE_CALENDAR_EVENT':
      return {
        ...state,
        calendarEvents: (state.calendarEvents || []).map((e) =>
          e.id === action.payload ? { ...e, completed: !e.completed } : e
        ),
      };

    case 'DELETE_CALENDAR_EVENT':
      return {
        ...state,
        calendarEvents: (state.calendarEvents || []).filter((e) => e.id !== action.payload),
      };

    // ===== Toasts =====
    case 'ADD_TOAST': {
      const toast = {
        id: Date.now().toString(),
        ...action.payload,
      };
      return {
        ...state,
        toasts: [...state.toasts, toast],
      };
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    // ===== Celebration =====
    case 'TRIGGER_CELEBRATION':
      return {
        ...state,
        celebration: action.payload,
      };

    case 'DISMISS_CELEBRATION':
      return {
        ...state,
        celebration: null,
      };

    // ===== Smart Import (creates a canvas with hypotheses) =====
    case 'IMPORT_CANVAS_DATA': {
      const { tobe, asis, gap, hypotheses: importedHypotheses } = action.payload;
      const canvas = {
        id: Date.now().toString(),
        tobe: tobe || '',
        asis: asis || '',
        gap: gap || '',
        hypotheses: (importedHypotheses || []).map((item, index) => ({
          id: (Date.now() + index + 1).toString(),
          status: 'unverified',
          hypothesis: '',
          verificationMethod: '',
          judgmentCriteria: '',
          learnings: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...item,
        })),
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        canvases: [canvas, ...state.canvases],
      };
    }

    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  // Auto-save on state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

// Custom hooks
export function useAppState() {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === null) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}
