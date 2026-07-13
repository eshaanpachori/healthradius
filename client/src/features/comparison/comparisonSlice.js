import { createSlice } from '@reduxjs/toolkit';

const loadComparisonFromSession = () => {
  try {
    const data = sessionStorage.getItem('healthradius_comparison');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

const saveComparisonToSession = (state) => {
  try {
    sessionStorage.setItem('healthradius_comparison', JSON.stringify(state));
  } catch (err) {
    // Ignore session storage errors
  }
};

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState: loadComparisonFromSession(),
  reducers: {
    addToComparison: (state, action) => {
      const hospital = action.payload;
      // Check if already in comparison
      const exists = state.some(h => h.id === hospital.id && h.source === hospital.source);
      if (exists) return;
      
      // Limit to 3 items
      if (state.length >= 3) {
        return;
      }
      
      state.push(hospital);
      saveComparisonToSession(state);
    },
    removeFromComparison: (state, action) => {
      const { id, source } = action.payload;
      const index = state.findIndex(h => h.id === id && h.source === source);
      if (index !== -1) {
        state.splice(index, 1);
        saveComparisonToSession(state);
      }
    },
    clearComparison: (state) => {
      state.length = 0;
      saveComparisonToSession(state);
    }
  }
});

export const { addToComparison, removeFromComparison, clearComparison } = comparisonSlice.actions;

export default comparisonSlice.reducer;

export const selectComparisonList = (state) => state.comparison;
