import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { createContext, useState } from "react";


const authContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType>(null);

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true }

        } catch (error: any) {
            let msg = error.message;
            return { success: false, msg }
        }
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            let response = await createUserWithEmailAndPassword(
                auth,
                email,
                password);
            await setDoc(doc(firestore, "patients", response?.user?.uid), {
                firstName,
                lastName,
                email,
                uid: response?.user?.uid,
            });
            return { success: true }

        } catch (error: any) {
            let msg = error.message;
            return { success: false, msg }
        }
    };

    const updateUserData = async (uid: string) => {
        try {
            const docRef = doc(firestore, "patients",uid);
            const docSnap = await getDoc(docRef);


            if(docSnap.exists()){
                const data = docSnap.data();
                const userData: UserType = {
                    uid: data?.uid,
                    email: data.email || null,
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    image: data.image || null,

                };
                setUser({...userData});

            }
        } catch (error: any) {
            let msg = error.message;
            // return { success: false, msg }
            console.log('error', error);
        }
    };

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        updateUserData,
    }

    return (
        <authContex
    )
};