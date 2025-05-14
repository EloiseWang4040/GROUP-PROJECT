import { atom } from "jotai";
// atoms/user.ts（書き換え）
import { User } from "firebase/auth";
export const userAtom = atom<User | null>(null);
