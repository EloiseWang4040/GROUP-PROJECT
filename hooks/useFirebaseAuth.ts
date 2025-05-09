// hooks/useFirebaseAuth.ts
import { useEffect }                          from "react";
import { useAtom }                            from "jotai";
import { createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User }                              from "firebase/auth";
import { auth }                               from "@/firebaseConfig";
import { userAtom }                           from "@/atoms/user";

export function useFirebaseAuth() {
    const [user, setUser] = useAtom(userAtom);

    /** 新規登録 */
    const register = async (email: string, password: string) => {
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            setUser(cred.user);
            return { success: true };
        } catch (e: any) {
            console.error("Register error:", e.message);
            return { success: false, message: e.message };
        }
    };

    /** サインイン */
    const signIn = async (email: string, password: string) => {
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            setUser(cred.user);
            return { success: true };
        } catch (e: any) {
            console.error("SignIn error:", e.message);
            return { success: false, message: e.message };
        }
    };

    /** サインアウト */
    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            return { success: true };
        } catch (e: any) {
            console.error("SignOut error:", e.message);
            return { success: false, message: e.message };
        }
    };

    /** ログイン状態の監視 */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            setUser(firebaseUser);
        });
        return unsubscribe;
    }, []);

    return { user, register, signIn, logout };
}