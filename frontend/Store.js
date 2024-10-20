import { create } from "zustand";

export const useStore = create((set) => ({
    home: 1,
    register: 0,
    about: 0,
    home_rem: () => set({ home: 0}),
    home_bring: () => set({ home:1}),
    reg_rem: () => set({ register: 0 }),
    reg_bring: () => set({ register: 1 }),
    about_bring: () => set({ about: 1 }),
    
}));
export default useStore;